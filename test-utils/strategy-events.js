'use strict';

const EventEmitter = require('events');

const StrategyUtilServer = class StrategyUtilServer extends EventEmitter {
    get [Symbol.toStringTag]() {
        return 'StrategyUtilServer';
    }

    emitBind(address) {
        this.emit('bind', address);
    }

    emitConnection(address) {
        this.emit('connection', address);
    }

    emitDisconnection(address) {
        this.emit('disconnection', address);
    }

    emitMessage(data, address) {
        this.emit('message', data, address);
    }

    emitClose() {
        this.emit('close');
    }

    emitError(error, address) {
        this.emit('error', error, address);
    }
};

const StrategyUtilClient = class StrategyUtilClient extends EventEmitter {
    get [Symbol.toStringTag]() {
        return 'StrategyUtilClient';
    }

    emitConnection(address) {
        this.emit('connection', address);
    }

    emitDisconnection(address) {
        this.emit('disconnection', address);
    }

    emitReconnectBackoff(attempt, delay, address) {
        this.emit('reconnect backoff', attempt, delay, address);
    }

    emitReconnectFailed(address) {
        this.emit('reconnect failed', address);
    }

    emitMessage(data, address) {
        this.emit('message', data, address);
    }

    emitClose() {
        this.emit('close');
    }

    emitError(error, address) {
        this.emit('error', error, address);
    }
};

module.exports.Server = StrategyUtilServer;
module.exports.Client = StrategyUtilClient;
