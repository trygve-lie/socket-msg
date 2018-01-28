'use strict';

const stream = require('stream');

const SocketMsgRep = class SocketMsgRep extends stream.Duplex {
    constructor(socket) {
        super();

        Object.defineProperty(this, 'socket', {
            value: socket
        });

        this.socket.on('connection', (uuid) => {
            this.emit('connection', uuid);
        });

        this.socket.on('disconnection', (uuid) => {
            this.emit('disconnection', uuid);
        });

        this.socket.on('reconnect backoff', (uuid, attempt, delay) => {
            this.emit('reconnect backoff', uuid, attempt, delay);
        });

        this.socket.on('reconnect failed', (uuid) => {
            this.emit('reconnect failed', uuid);
        });

        this.socket.on('message', (data, uuid) => {
            this.emit('message', data.toString(), uuid);
        });

        this.socket.on('close', () => {
            this.emit('close');
        });

        this.socket.on('error', (error, uuid) => {
            this.emit('error', error, uuid);
        });
    }

    get [Symbol.toStringTag]() {
        return 'SocketMsgRep';
    }

    connect(options) {
        return new Promise((resolve, reject) => {
            this.socket.connect(options, (error, address) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(address);
            });
        });
    }

    close() {
        return new Promise((resolve) => {
            this.socket.close(resolve);
        });
    }
};

module.exports = SocketMsgRep;

