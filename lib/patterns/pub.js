'use strict';

const stream = require('stream');

const SocketMsgPub = class SocketMsgPub extends stream.Duplex {
    constructor(socket) {
        super();

        Object.defineProperty(this, 'socket', {
            value: new socket.Server()
        });
    }

    /**
     * Meta
     */

    get [Symbol.toStringTag]() {
        return 'SocketMsgPub';
    }

    bind(options) {
        this.socket.bind(options);
    }

    close() {
        this.socket.close();
    }

    send(message) {
        this.socket.broadcast(message);
    }
};

module.exports = SocketMsgPub;
