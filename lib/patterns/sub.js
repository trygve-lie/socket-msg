'use strict';

const stream = require('stream');

const SocketMsgSub = class SocketMsgSub extends stream.Duplex {
    constructor(socket, strategy) {
        super();

        Object.defineProperty(this, 'socket', {
            value: new socket.Client(strategy)
        });

        this.socket.on('message', (data) => {
            this.emit('message', data.toString());
        });
    }

    get [Symbol.toStringTag]() {
        return 'SocketMsgSub';
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

module.exports = SocketMsgSub;

