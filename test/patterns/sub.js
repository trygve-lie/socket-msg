'use strict';

const event = require('../../test-utils/strategy-events');
const tcp = require('../../lib/transports/tcp');
const Sub = require('../../lib/patterns/sub');
const tap = require('tap');

/**
 * Constructor
 */

tap.test('SocketMsgSub() - object type - should be SocketMsgSub', (t) => {
    const sub = new Sub(new tcp.Client());
    t.equal(Object.prototype.toString.call(sub), '[object SocketMsgSub]');
    t.end();
});

tap.test('SocketMsgSub.on("connection") - transport emits "connection" event - should emit "connection" event', (t) => {
    const mock = new event.Client();
    const sub = new Sub(mock);

    sub.on('connection', (uuid) => {
        t.equal(uuid, 'a');
        t.end();
    });

    mock.emitConnection('a');
});

tap.test('SocketMsgSub.on("disconnection") - transport emits "disconnection" event - should emit "disconnection" event', (t) => {
    const mock = new event.Client();
    const sub = new Sub(mock);

    sub.on('disconnection', (uuid) => {
        t.equal(uuid, 'b');
        t.end();
    });

    mock.emitDisconnection('b');
});

tap.test('SocketMsgSub.on("reconnect backoff") - transport emits "reconnect backoff" event - should emit "reconnect backoff" event', (t) => {
    const mock = new event.Client();
    const sub = new Sub(mock);

    sub.on('reconnect backoff', (uuid, attempt, delay) => {
        t.equal(uuid, 'c');
        t.equal(attempt, 2);
        t.equal(delay, 800);
        t.end();
    });

    mock.emitReconnectBackoff('c', 2, 800);
});

tap.test('SocketMsgSub.on("reconnect failed") - transport emits "reconnect failed" event - should emit "reconnect failed" event', (t) => {
    const mock = new event.Client();
    const sub = new Sub(mock);

    sub.on('reconnect failed', (uuid) => {
        t.equal(uuid, 'd');
        t.end();
    });

    mock.emitReconnectFailed('d');
});

tap.test('SocketMsgSub.on("close") - transport emits "close" event - should emit "close" event', (t) => {
    const mock = new event.Client();
    const sub = new Sub(mock);

    sub.on('close', () => {
        t.ok(true);
        t.end();
    });

    mock.emitClose();
});

tap.test('SocketMsgSub.on("error") - transport emits "error" event - should emit "error" event', (t) => {
    const mock = new event.Client();
    const sub = new Sub(mock);

    sub.on('error', (error, uuid) => {
        t.equal(error, 'foo');
        t.equal(uuid, 'e');
        t.end();
    });

    mock.emitError('foo', 'e');
});

tap.test('SocketMsgSub.on("message") - transport emits "message" event - should emit "message" event', (t) => {
    const mock = new event.Client();
    const sub = new Sub(mock);

    sub.on('message', (data, uuid) => {
        t.equal(data, 'bar');
        t.equal(uuid, 'f');
        t.end();
    });

    mock.emitMessage('bar', 'f');
});
