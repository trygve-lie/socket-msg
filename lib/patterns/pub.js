'use strict';

const stream = require('stream');

const SocketMsgPub = class SocketMsgPub extends stream.Duplex {
    constructor(socket) {
        super();

        Object.defineProperty(this, 'socket', {
            value: new socket.Server()
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
