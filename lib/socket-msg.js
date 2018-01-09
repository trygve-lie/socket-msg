'use strict';

const crypto = require('crypto');
const tcp = require('./transports/tcp');

const Pub = require('./patterns/pub');
const Sub = require('./patterns/sub');

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

    tcp(pattern = '') {
        const socket = tcp;
        if (pattern === 'pub') return new Pub(socket);
        if (pattern === 'sub') return new Sub(socket);
        throw new Error('No such protocol');
    }

    tls() {
        throw new Error('Not implemented');
    }

    ws() {
        throw new Error('Not implemented');
    }

    wss() {
        throw new Error('Not implemented');
    }
};

module.exports = SocketMsg;
