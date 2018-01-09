'use strict';

const crypto = require('crypto');

const SocketMsg = class SocketMsg {
    constructor({
        id = undefined,
    } = {}) {
        Object.defineProperty(this, 'id', {
            value: id || crypto.randomBytes(3 * 4).toString('base64'),
            enumerable: true,
        });
    }

    /**
     * Meta
     */

    get [Symbol.toStringTag]() {
        return 'SocketMsg';
    }

    tcp() {

    }

    tls() {

    }

    ws() {

    }
};

module.exports = SocketMsg;
