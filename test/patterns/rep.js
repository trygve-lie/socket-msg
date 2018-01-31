'use strict';

const event = require('../../test-utils/strategy-events');
const tcp = require('../../lib/transports/tcp');
const Rep = require('../../lib/patterns/rep');
const tap = require('tap');

/**
 * Constructor
 */

tap.test('SocketMsgRep() - object type - should be SocketMsgRep', (t) => {
    const rep = new Rep(new tcp.Client());
    t.equal(Object.prototype.toString.call(rep), '[object SocketMsgRep]');
    t.end();
});

tap.test('SocketMsgRep.on("connection") - transport emits "connection" event - should emit "connection" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('connection', () => {
        t.ok(true);
        t.end();
    });

    mock.emitConnection();
});

tap.test('SocketMsgRep.on("disconnection") - transport emits "disconnection" event - should emit "disconnection" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('disconnection', () => {
        t.ok(true);
        t.end();
    });

    mock.emitDisconnection();
});

tap.test('SocketMsgRep.on("reconnect backoff") - transport emits "reconnect backoff" event - should emit "reconnect backoff" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('reconnect backoff', (attempt, delay) => {
        t.equal(attempt, 2);
        t.equal(delay, 800);
        t.end();
    });

    mock.emitReconnectBackoff(2, 800);
});

tap.test('SocketMsgRep.on("reconnect failed") - transport emits "reconnect failed" event - should emit "reconnect failed" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('reconnect failed', () => {
        t.ok(true);
        t.end();
    });

    mock.emitReconnectFailed();
});

tap.test('SocketMsgRep.on("close") - transport emits "close" event - should emit "close" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('close', () => {
        t.ok(true);
        t.end();
    });

    mock.emitClose();
});

tap.test('SocketMsgRep.on("error") - transport emits "error" event - should emit "error" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('error', (error) => {
        t.equal(error, 'foo');
        t.ok(true);
        t.end();
    });

    mock.emitError('foo');
});

tap.test('SocketMsgRep.on("message") - transport emits "message" event - should emit "message" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('message', (data) => {
        t.equal(data, 'bar');
        t.end();
    });

    mock.emitMessage('bar');
});
