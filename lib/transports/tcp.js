'use strict';

const backoff = require('backoff');
const stream = require('stream');
const crypto = require('crypto');
const net = require('net');

const SocketMsgTcpServer = class SocketMsgTcpServer extends stream.Duplex {
    constructor(args) {
        super(args);

        Object.defineProperty(this, 'server', {
            value: net.createServer()
        });

        Object.defineProperty(this, 'connections', {
            value: new Map()
        });

        this.server.on('connection', (socket) => {
            const uuid = crypto.randomBytes(3 * 4).toString('base64');
            this.connections.set(uuid, socket);

            socket.on('data', (data) => {
                this.emit('message', data);
            });

            socket.on('close', () => {
                this.connections.delete(uuid);
            });
        });
    }

    /**
     * Meta
     */

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
            callback(true);
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

    broadcast(message) {
        let length = 0;
        this.connections.forEach((socket) => {
            socket.write(Buffer.from(message));
            length++;
        });
        return length;
    }
};


const SocketMsgTcpClient = class SocketMsgTcpClient extends stream.Duplex {
    constructor(args) {
        super(args);

        Object.defineProperty(this, 'connections', {
            value: new Map()
        });

        Object.defineProperty(this, 'open', {
            value: false,
            writable: true,
        });
    }

    /**
     * Meta
     */

    get [Symbol.toStringTag]() {
        return 'SocketMsgTcpClient';
    }

    connect(options, callback) {
        this.open = true;

        // Keep track on if one are in the init phase
        // "true" when no previous connection have been done
        // "false" when there has been one previous connection
        let initing = true;

        const uuid = crypto.randomBytes(3 * 4).toString('base64');

        // Set up a backoff strategy
        const retry = backoff.fibonacci({
            randomisationFactor: 0,
            initialDelay: 2,
            maxDelay: 1000
        });
        retry.failAfter(10);

        // Backoff starts, wait given delay time
        retry.on('backoff', () => {
            // console.log('on backoff', `${number} ${delay}ms`);
        });

        // Backoff time ended, attempt to connect
        retry.on('ready', () => {
            const socket = net.createConnection(options);

            socket.on('connect', () => {
                retry.reset();
                retry.failAfter(1000);
                initing = false;
                callback(null, options);
            });

            socket.on('close', () => {
                this.connections.delete(uuid);
                if (this.open) {
                    retry.backoff();
                }
            });

            socket.on('error', () => {

            });

            socket.on('data', (data) => {
                this.emit('message', data);
            });

            this.connections.set(uuid, socket);
        });

        // Backoff terminated, no more connection attemps will be done
        retry.on('fail', () => {
            if (initing) {
                callback(new Error('Could not connect to host'));
            }
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
    }

    broadcast(message) {
        let length = 0;
        this.connections.forEach((socket) => {
            socket.write(Buffer.from(message));
            length++;
        });
        return length;
    }
};

module.exports.Server = SocketMsgTcpServer;
module.exports.Client = SocketMsgTcpClient;
