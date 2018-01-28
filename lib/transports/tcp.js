'use strict';

const backoff = require('backoff');
const stream = require('stream');
const utils = require('../utils');
const fmsg = require('framed-msg');
const net = require('net');

const SocketMsgTcpServer = class SocketMsgTcpServer extends stream.Duplex {
    constructor() {
        super();

        Object.defineProperty(this, 'server', {
            value: net.createServer((socket) => {
                socket.setNoDelay(true);
            }),
        });

        Object.defineProperty(this, 'connections', {
            value: new Map(),
        });

        Object.defineProperty(this, 'rrIterator', {
            value: [],
            writable: true,
        });


        this.server.on('connection', (socket) => {
            const uuid = utils.uuid();
            this.connections.set(uuid, socket);
            this.emit('connection', uuid);

            const parser = new fmsg.DecodeStream();

            socket.on('close', () => {
                this.connections.delete(uuid);
                this.rrIterator = [];
                this.emit('disconnection', uuid);
            });

            /* istanbul ignore next */
            socket.on('error', (error) => {
                this.emit('error', error);
            });

            socket.pipe(parser).pipe(new stream.Writable({
                objectMode: true,
                write: (chunk, enc, next) => {
                    this.emit('message', chunk[0], uuid);
                    next();
                }
            }));
        });
    }

    get [Symbol.toStringTag]() {
        return 'SocketMsgTcpServer';
    }

    bind(options, callback) {
        // Error event listener
        const errorListener = (error) => {
            callback(error, null);
        };

        // Listen success event listener
        const listenListener = () => {
            this.server.removeListener('error', errorListener);
            callback(null, this.server.address());
            this.emit('bind', this.server.address());
        };

        // Try to start listening
        this.server
            .once('error', errorListener)
            .once('listening', listenListener)
            .listen(options);
    }

    close(callback) {
        // Listen for close event
        this.server.once('close', () => {
            if (callback) callback(true);
            this.emit('close');
        });

        // Stop accepting connections
        this.server.close();

        // Close all existing connections
        this.connections.forEach((socket) => {
            socket.end();
        });

        // Clear connection pool
        this.connections.clear();
    }

    send(uuid, message) {
        const socket = this.connections.get(uuid);
        const msg = fmsg.encode([Buffer.from(message)]);
        socket.write(msg);
    }

    broadcast(message) {
        let length = 0;
        this.connections.forEach((socket, key) => {
            this.send(key, message);
            length++;
        });
        return length;
    }

    roundrobin(message) {
        if (this.rrIterator.length === 0) {
            this.rrIterator = Array.from(this.connections.keys())
        }

        const uuid = this.rrIterator.shift();
        this.send(uuid, message);
        this.rrIterator.push(uuid);

    }
};


const SocketMsgTcpClient = class SocketMsgTcpClient extends stream.Duplex {
    constructor(strategy) {
        super();

        Object.defineProperty(this, 'connections', {
            value: new Map()
        });

        Object.defineProperty(this, 'strategy', {
            value: utils.strategy(strategy)
        });

        Object.defineProperty(this, 'open', {
            value: false,
            writable: true,
        });
    }

    get [Symbol.toStringTag]() {
        return 'SocketMsgTcpClient';
    }

    connect(options, callback) {
        this.open = true;

        // Keep track on if one are in the init phase
        // "true" when no previous connection have been done
        // "false" when there has been one previous connection
        let initing = true;

        const uuid = utils.uuid();

        // Set up a backoff strategy
        const retry = backoff.fibonacci(this.strategy);
        retry.failAfter(10);

        // Backoff starts, wait given delay time
        retry.on('backoff', (attempt, delay) => {
            this.emit('reconnect backoff', uuid, attempt, delay);
        });

        // Backoff time ended, attempt to connect
        retry.on('ready', () => {
            const socket = new net.Socket();
            socket.setNoDelay(true);
            socket.connect(options);

            const parser = new fmsg.DecodeStream();

            socket.on('connect', () => {
                retry.reset();
                retry.failAfter(this.strategy.failAfter);
                initing = false;
                this.emit('connection', uuid);
                callback(null, options);
            });

            socket.on('close', () => {
                this.connections.delete(uuid);
                if (this.open) {
                    this.emit('disconnection', uuid);
                    retry.backoff();
                }
            });

            socket.on('error', (error) => {
                this.emit('error', error);
            });

            this.connections.set(uuid, socket);

            socket.pipe(parser).pipe(new stream.Writable({
                objectMode: true,
                write: (chunk, enc, next) => {
                    this.emit('message', chunk[0], uuid);
                    next();
                }
            }));
        });

        // Backoff terminated, no more connection attemps will be done
        retry.on('fail', () => {
            if (initing) {
                callback(new Error('Could not connect to host'), null);
            }
            this.emit('reconnect failed', uuid);
        });

        // Connect to server
        retry.backoff();
    }

    close(callback) {
        // Set open flag to false to indicate we are force closing
        this.open = false;

        // Close all existing connections
        this.connections.forEach((socket) => {
            socket.end();
        });

        // Clear connection pool
        this.connections.clear();

        callback(true);
        this.emit('close');
    }

    send(uuid, message) {
        const socket = this.connections.get(uuid);
        const msg = fmsg.encode([Buffer.from(message)]);
        socket.write(msg);
    }

    broadcast(message) {
        let length = 0;
        this.connections.forEach((socket, key) => {
            this.send(key, message);
            length++;
        });
        return length;
    }
};

module.exports.Server = SocketMsgTcpServer;
module.exports.Client = SocketMsgTcpClient;
