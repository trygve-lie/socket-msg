'use strict';

const stream = require('stream');

const SocketMsgReq = class SocketMsgReq extends stream.Duplex {
    constructor(socket) {
        super();

        Object.defineProperty(this, 'socket', {
            value: socket
        });

        Object.defineProperty(this, 'callbacks', {
            value: new Map()
        });

        Object.defineProperty(this, 'trackIds', {
            value: 0,
            writable: true,
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

        this.socket.on('message', (message, uuis, channel, trackId) => {
            const fn = this.callbacks.get(parseInt(trackId, 10));
            this.callbacks.delete(parseInt(trackId, 10));
            fn(null, message.toString());
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
        return new Promise((resolve, reject) => {
            const id = this.trackIds++;
            const callback = (error, msg) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(msg);
            };
            this.callbacks.set(id, callback);
            this.socket.roundrobin(message, '', id.toString());
        });
    }
};

module.exports = SocketMsgReq;
