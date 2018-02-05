'use strict';

const stream = require('stream');

const SocketMsgRep = class SocketMsgRep extends stream.Duplex {
    constructor(socket) {
        super();

        Object.defineProperty(this, 'socket', {
            value: socket
        });

        this.socket.on('connection', () => {
            this.emit('connection');
        });

        this.socket.on('disconnection', () => {
            this.emit('disconnection');
        });

        this.socket.on('reconnect backoff', (attempt, delay) => {
            this.emit('reconnect backoff', attempt, delay);
        });

        this.socket.on('reconnect failed', () => {
            this.emit('reconnect failed');
        });

        this.socket.on('close', () => {
            this.emit('close');
        });

        this.socket.on('error', (error) => {
            this.emit('error', error);
        });

        this.socket.on('message', (message, channel, trackId) => {
            this.emit('message', message.toString(), (data) => {
                this.socket.send(data, channel, trackId);
            });
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
