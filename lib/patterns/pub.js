'use strict';

const stream = require('stream');

const SocketMsgPub = class SocketMsgPub extends stream.Duplex {
    constructor(socket) {
        super();

        Object.defineProperty(this, 'socket', {
            value: socket
        });

        this.socket.on('bind', (address) => {
            this.emit('bind', address);
        });

        this.socket.on('connection', (uuid) => {
            this.emit('connection', uuid);
        });

        this.socket.on('disconnection', (uuid) => {
            this.emit('disconnection', uuid);
        });

        this.socket.on('close', () => {
            this.emit('close');
        });

        this.socket.on('error', (error, uuid) => {
            this.emit('error', error, uuid);
        });
    }

    get [Symbol.toStringTag]() {
        return 'SocketMsgPub';
    }

    bind(options) {
        return new Promise((resolve, reject) => {
            this.socket.bind(options, (error, address) => {
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

    send(message) {
        return this.socket.broadcast(message);
    }
};

module.exports = SocketMsgPub;
