'use strict';

const stream = require('stream');

const SocketMsgReq = class SocketMsgReq extends stream.Duplex {
    constructor(socket) {
        super();

        Object.defineProperty(this, 'socket', {
            value: socket
        });

        this.socket.on('bind', (address) => {
            this.emit('bind', address);
        });

        this.socket.on('connection', () => {
            this.emit('connection');
        });

        this.socket.on('disconnection', () => {
            this.emit('disconnection');
        });

        this.socket.on('close', () => {
            this.emit('close');
        });

        this.socket.on('error', (error) => {
            this.emit('error', error);
        });
    }

    get [Symbol.toStringTag]() {
        return 'SocketMsgReq';
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

module.exports = SocketMsgReq;
