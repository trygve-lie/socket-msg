'use strict';

const EventEmitter = require('events');

const StrategyUtilServer = class StrategyUtilServer extends EventEmitter {
    constructor() {
        super();
    }

    get [Symbol.toStringTag]() {
        return 'StrategyUtilServer';
    }

    emitBind(address) {
        this.emit('bind', address);
    }

    emitConnection(uuid) {
        this.emit('connection', uuid);
    }

    emitDisconnection(uuid) {
        this.emit('disconnection', uuid);
    }

    emitMessage(data, uuid) {
        this.emit('message', data, uuid);
    }

    emitClose() {
        this.emit('close');
    }

    emitError(error, uuid) {
        this.emit('error', error, uuid);
    }
};

const StrategyUtilClient = class StrategyUtilClient extends EventEmitter {
    constructor() {
        super();
    }

    get [Symbol.toStringTag]() {
        return 'StrategyUtilClient';
    }

    emitConnection(uuid) {
        this.emit('connection', uuid);
    }

    emitDisconnection(uuid) {
        this.emit('disconnection', uuid);
    }

    emitReconnectBackoff(uuid, attempt, delay) {
        this.emit('reconnect backoff', uuid, attempt, delay);
    }

    emitReconnectFailed(uuid) {
        this.emit('reconnect failed', uuid);
    }

    emitMessage(data, uuid) {
        this.emit('message', data, uuid);
    }

    emitClose() {
        this.emit('close');
    }

    emitError(error, uuid) {
        this.emit('error', error, uuid);
    }
};

module.exports.Server = StrategyUtilServer;
module.exports.Client = StrategyUtilClient;
