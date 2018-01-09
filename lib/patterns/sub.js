'use strict';

const stream = require('stream');

const SocketMsgSub = class SocketMsgSub extends stream.Duplex {
    constructor(socket) {
        super();

        Object.defineProperty(this, 'socket', {
            value: new socket.Client()
        });
    }


    /**
     * Meta
     */

    get [Symbol.toStringTag]() {
        return 'SocketMsgSub';
    }

    connect(options) {
        this.socket.connect(options);
    }


    close() {
        this.socket.close();
    }
};

module.exports = SocketMsgSub;

