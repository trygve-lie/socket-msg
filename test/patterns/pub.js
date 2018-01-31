'use strict';

const event = require('../../test-utils/strategy-events');
const tcp = require('../../lib/transports/tcp');
const Pub = require('../../lib/patterns/pub');
const tap = require('tap');

/**
 * Constructor
 */

tap.test('SocketMsgPub() - object type - should be SocketMsgPub', (t) => {
    const pub = new Pub(new tcp.Server());
    t.equal(Object.prototype.toString.call(pub), '[object SocketMsgPub]');
    t.end();
});

tap.test('SocketMsgPub.on("connection") - transport emits "connection" event - should emit "connection" event', (t) => {
    const mock = new event.Server();
    const pub = new Pub(mock);

    pub.on('connection', () => {
        t.ok(true);
        t.end();
    });

    mock.emitConnection();
});

tap.test('SocketMsgPub.on("disconnection") - transport emits "disconnection" event - should emit "disconnection" event', (t) => {
    const mock = new event.Server();
    const pub = new Pub(mock);

    pub.on('disconnection', () => {
        t.ok(true);
        t.end();
    });

    mock.emitDisconnection();
});

tap.test('SocketMsgPub.on("close") - transport emits "close" event - should emit "close" event', (t) => {
    const mock = new event.Server();
    const pub = new Pub(mock);

    pub.on('close', () => {
        t.ok(true);
        t.end();
    });

    mock.emitClose();
});

tap.test('SocketMsgPub.on("error") - transport emits "error" event - should emit "error" event', (t) => {
    const mock = new event.Server();
    const pub = new Pub(mock);

    pub.on('error', (error) => {
        t.equal(error, 'foo');
        t.end();
    });

    mock.emitError('foo');
});

tap.test('SocketMsgPub.on("bind") - transport emits "bind" event - should emit "bind" event', (t) => {
    const mock = new event.Server();
    const pub = new Pub(mock);

    pub.on('bind', (address) => {
        t.equal(address, 'bar');
        t.end();
    });

    mock.emitBind('bar');
});
