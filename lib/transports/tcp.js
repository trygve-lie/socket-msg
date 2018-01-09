'use strict';

const backoff = require('backoff');
const stream = require('stream');
const crypto = require('crypto');
const net = require('net');

// https://github.com/tim-kos/node-retry

const SocketMsgTcpServer = class SocketMsgTcpServer extends stream.Duplex {
    constructor(args) {
        super(args);

        Object.defineProperty(this, 'socket', {
            value: net.createServer()
        });

        Object.defineProperty(this, 'connections', {
            value: new Map()
        });

        this.socket.on('listening', (socket) => {
            console.log('host ready');
            this.emit('ready', this.socket.address());
        });

        this.socket.on('connection', (socket) => {
            console.log('host got connection');
            const uuid = crypto.randomBytes(3 * 4).toString('base64');
            this.connections.set(uuid, socket);

            socket.on('data', (data) => {
                console.log('X', data.toString());
            });

            socket.on('close', (errored) => {
                this.connections.delete(uuid);
                console.log('socket closed');
            });
        });

        this.socket.on('close', () => {
            console.log('server closed');
        });

        this.socket.on('error', (err) => {
            // handle errors here
            throw err;
        });
    }

    /**
     * Meta
     */

    get [Symbol.toStringTag]() {
        return 'SocketMsgTcpServer';
    }

    bind(options) {
        this.socket.listen(options);
    }

    close() {
        // Stop accepting connections
        this.socket.close();

        // Close all existing connections
        this.connections.forEach((socket) => {
            socket.end();
        });

        // Clear connection pool
        this.connections.clear();
    }

    broadcast(message) {
        this.connections.forEach((socket, key) => {
            socket.write(Buffer.from(message));
        });
    }
};


const SocketMsgTcpClient = class SocketMsgTcpClient extends stream.Duplex {
    constructor(args) {
        super(args);

        Object.defineProperty(this, 'connections', {
            value: new Map()
        });

        this.open = false;
    }

    /**
     * Meta
     */

    get [Symbol.toStringTag]() {
        return 'SocketMsgTcpClient';
    }

    _connect(uuid, retry, options) {
        const socket = net.createConnection(options);

        socket.on('connect', (data) => {
            console.log('Y', 'client connected to server!');
        });

        socket.on('data', (data) => {
            console.log('Y', data.toString());
        });

        socket.on('close', () => {
            console.log('Y', 'client disconnected from server', uuid);
        });

        socket.on('error', (error) => {
            // console.log('socket error', error);
        });

        this.connections.set(uuid, {
            socket,
            retry,
            uuid
        });

        return socket;
    }

    connect(options) {
        this.open = true;

        const uuid = crypto.randomBytes(3 * 4).toString('base64');

        const retry = backoff.fibonacci({
            randomisationFactor: 0,
            initialDelay: 10,
            maxDelay: 6000
        });
        retry.failAfter(100);

        // Backoff starts, wait given delay time
        retry.on('backoff', (number, delay) => {
            console.log('on backoff', number + ' ' + delay + 'ms');
        });

        // Backoff time ended, attempt to connect
        retry.on('ready', (number, delay) => {
            console.log('on backoff ready', number + ' ' + delay + 'ms');

            const socket = this._connect(uuid, retry, options);
            socket.on('connect', () => {
                retry.reset();
            });
            socket.on('close', () => {
                if (this.open) {
                    retry.backoff();
                }
            });
        });

        // Backoff terminated, no more connection attemps will be done
        retry.on('fail', () => {
            console.log('on backoff fail');
        });

        // Connect to server
        const socket = this._connect(uuid, retry, options);
        socket.on('close', () => {
            if (this.open) {
                retry.backoff();
            }
        });
    }

    close() {
        this.open = false;

        this.connections.forEach((connection, key) => {
            connection.socket.end();
        });

        this.connections.clear();
    }
};

module.exports.Server = SocketMsgTcpServer;
module.exports.Client = SocketMsgTcpClient;
