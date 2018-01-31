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
            this.rrIterator = Array.from(this.connections.keys());
        }

        const uuid = this.rrIterator.shift();
        this.send(uuid, message);
        this.rrIterator.push(uuid);
    }
};



const SocketMsgTcpClient = class SocketMsgTcpClient extends stream.Duplex {
    constructor(strategy) {
        super();

        Object.defineProperty(this, 'socket', {
            value: new net.Socket()
        });

        Object.defineProperty(this, 'strategy', {
            value: utils.strategy(strategy)
        });

        Object.defineProperty(this, 'open', {
            value: false,
            writable: true,
        });

        Object.defineProperty(this, 'retry', {
            value: backoff.fibonacci(this.strategy)
        });

        this.retry.failAfter(10);
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

        const parser = new fmsg.DecodeStream();

        this.socket.on('connect', () => {
            this.retry.reset();
            this.retry.failAfter(this.strategy.failAfter);
            initing = false;
            this.emit('connection');
            callback(null, options);
        });

        this.socket.on('close', () => {
            if (this.open) {
                this.emit('disconnection');
                this.retry.backoff();
            }
        });

        this.socket.on('error', (error) => {
            this.emit('error', error);
        });

        this.socket.pipe(parser).pipe(new stream.Writable({
            objectMode: true,
            write: (chunk, enc, next) => {
                this.emit('message', chunk[0]);
                next();
            }
        }));


        // Backoff starts, wait given delay time
        this.retry.on('backoff', (attempt, delay) => {
            this.emit('reconnect backoff', attempt, delay);
        });

        // Backoff time ended, attempt to connect
        this.retry.on('ready', () => {
            this.socket.connect(options);
        });

        // Backoff terminated, no more connection attemps will be done
        this.retry.on('fail', () => {
            if (initing) {
                callback(new Error('Could not connect to host'), null);
            }
            this.emit('reconnect failed');
        });

        // Connect to server
        this.retry.backoff();
    }

    close(callback) {
        // Set open flag to false to indicate we are force closing
        this.open = false;

        this.socket.once('close', () => {
            callback(true);
            this.emit('close');
        });

        this.socket.end();
    }

    send(message) {
        const msg = fmsg.encode([Buffer.from(message)]);
        this.socket.write(msg);
    }
};


module.exports.Server = SocketMsgTcpServer;
module.exports.Client = SocketMsgTcpClient;
