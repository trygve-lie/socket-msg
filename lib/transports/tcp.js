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
                    this.emit('message', chunk[0], uuid, chunk[1].toString(), chunk[2].toString());
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

    send(uuid, message, channel = '', trackId = '') {
        const socket = this.connections.get(uuid);
        const msg = Buffer.from(message);
        const chn = Buffer.from(channel);
        const tId = Buffer.from(trackId);
        const bin = fmsg.encode([msg, chn, tId]);
        socket.write(bin);
    }

    broadcast(message, channel = '', trackId = '') {
        let length = 0;
        this.connections.forEach((socket, key) => {
            this.send(key, message, channel, trackId);
            length++;
        });
        return length;
    }

    roundrobin(message, channel = '', trackId = '') {
        if (this.rrIterator.length === 0) {
            this.rrIterator = Array.from(this.connections.keys());
        }

        const uuid = this.rrIterator.shift();
        this.send(uuid, message, channel, trackId);
        this.rrIterator.push(uuid);
    }
};


const SocketMsgTcpClient = class SocketMsgTcpClient extends stream.Duplex {
    constructor(strategy) {
        super();

        Object.defineProperty(this, 'socket', {
            value: new net.Socket(),
            writable: true,
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

        const retry = backoff.fibonacci(this.strategy);
        retry.failAfter(10);

        // Backoff starts, wait given delay time
        retry.on('backoff', (attempt, delay) => {
            this.emit('reconnect backoff', attempt, delay);
        });

        // Backoff time ended, attempt to connect
        retry.on('ready', () => {
            const socket = new net.Socket();
            socket.setNoDelay(true);

            const parser = new fmsg.DecodeStream();

            socket.on('connect', () => {
                retry.reset();
                retry.failAfter(this.strategy.failAfter);
                initing = false;
                this.emit('connection');
                callback(null, options);
            });

            socket.on('close', () => {
                if (this.open) {
                    this.emit('disconnection');
                    retry.backoff();
                }
            });

            socket.on('error', (error) => {
                this.emit('error', error);
            });

            socket.pipe(parser).pipe(new stream.Writable({
                objectMode: true,
                write: (chunk, enc, next) => {
                    this.emit('message', chunk[0], chunk[1].toString(), chunk[2].toString());
                    next();
                }
            }));

            this.socket = socket.connect(options);
        });

        // Backoff terminated, no more connection attemps will be done
        retry.on('fail', () => {
            if (initing) {
                callback(new Error('Could not connect to host'), null);
            }
            this.emit('reconnect failed');
        });

        // Connect to server
        retry.backoff();
    }

    close(callback) {
        // Set open flag to false to indicate we are force closing
        this.open = false;

        if (this.socket.destroyed) {
            callback(true);
            return;
        }

        this.socket.once('close', () => {
            callback(true);
            this.emit('close');
        });

        this.socket.end();
    }

    send(message, channel = '', trackId = '') {
        if (this.socket.destroyed) {
            this.emit('error', new Error('Socket is closed, can not write message'));
            return;
        }

        const msg = Buffer.from(message);
        const chn = Buffer.from(channel);
        const tId = Buffer.from(trackId);
        const bin = fmsg.encode([msg, chn, tId]);
        this.socket.write(bin);
    }
};


module.exports.Server = SocketMsgTcpServer;
module.exports.Client = SocketMsgTcpClient;
