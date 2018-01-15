'use strict';

const backoff = require('backoff');
const stream = require('stream');
const utils = require('../utils');
const net = require('net');

const SocketMsgTcpServer = class SocketMsgTcpServer extends stream.Duplex {
    constructor() {
        super();

        Object.defineProperty(this, 'server', {
            value: net.createServer()
        });

        Object.defineProperty(this, 'connections', {
            value: new Map()
        });

        this.server.on('connection', (socket) => {
            const uuid = utils.uuid();
            this.connections.set(uuid, socket);
            this.emit('connection', uuid);

            socket.on('data', (data) => {
                this.emit('message', data, uuid);
            });

            socket.on('close', () => {
                this.connections.delete(uuid);
                this.emit('disconnection', uuid);
            });

            socket.on('error', (error) => {
                this.emit('error', error);
            });
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
        socket.write(message);
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
            const socket = net.createConnection(options);

            socket.on('connect', () => {
                retry.reset();
                retry.failAfter(1000);
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

            socket.on('error', () => {

            });

            socket.on('data', (data) => {
                this.emit('message', data, uuid);
            });

            this.connections.set(uuid, socket);
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
        socket.write(message);
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
