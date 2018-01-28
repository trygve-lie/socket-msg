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

    rep.on('connection', (uuid) => {
        t.equal(uuid, 'a');
        t.end();
    });

    mock.emitConnection('a');
});

tap.test('SocketMsgRep.on("disconnection") - transport emits "disconnection" event - should emit "disconnection" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('disconnection', (uuid) => {
        t.equal(uuid, 'b');
        t.end();
    });

    mock.emitDisconnection('b');
});

tap.test('SocketMsgRep.on("reconnect backoff") - transport emits "reconnect backoff" event - should emit "reconnect backoff" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('reconnect backoff', (uuid, attempt, delay) => {
        t.equal(uuid, 'c');
        t.equal(attempt, 2);
        t.equal(delay, 800);
        t.end();
    });

    mock.emitReconnectBackoff('c', 2, 800);
});

tap.test('SocketMsgRep.on("reconnect failed") - transport emits "reconnect failed" event - should emit "reconnect failed" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('reconnect failed', (uuid) => {
        t.equal(uuid, 'd');
        t.end();
    });

    mock.emitReconnectFailed('d');
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

    rep.on('error', (error, uuid) => {
        t.equal(error, 'foo');
        t.equal(uuid, 'e');
        t.end();
    });

    mock.emitError('foo', 'e');
});

tap.test('SocketMsgRep.on("message") - transport emits "message" event - should emit "message" event', (t) => {
    const mock = new event.Client();
    const rep = new Rep(mock);

    rep.on('message', (data, uuid) => {
        t.equal(data, 'bar');
        t.equal(uuid, 'f');
        t.end();
    });

    mock.emitMessage('bar', 'f');
});
