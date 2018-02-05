'use strict';

const utils = require('./utils');
const tcp = require('./transports/tcp');

const Pub = require('./patterns/pub');
const Sub = require('./patterns/sub');

const Req = require('./patterns/req');
const Rep = require('./patterns/rep');

const SocketMsg = class SocketMsg {
    constructor({
        id = undefined,
    } = {}) {
        Object.defineProperty(this, 'id', {
            value: utils.uuid(id),
            enumerable: true,
        });
    }

    get [Symbol.toStringTag]() {
        return 'SocketMsg';
    }

    tcp(pattern = '', strategy) {
        const server = new tcp.Server();
        const client = new tcp.Client(strategy);

        if (pattern === 'pub') return new Pub(server);
        if (pattern === 'sub') return new Sub(client);

        if (pattern === 'req') return new Req(server);
        if (pattern === 'rep') return new Rep(client);
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
