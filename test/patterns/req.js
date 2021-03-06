'use strict';

const event = require('../../test-utils/strategy-events');
const tcp = require('../../lib/transports/tcp');
const Req = require('../../lib/patterns/req');
const tap = require('tap');

/**
 * Constructor
 */

tap.test('SocketMsgReq() - object type - should be SocketMsgReq', (t) => {
    const req = new Req(new tcp.Server());
    t.equal(Object.prototype.toString.call(req), '[object SocketMsgReq]');
    t.end();
});

tap.test('SocketMsgReq.on("connection") - transport emits "connection" event - should emit "connection" event', (t) => {
    const mock = new event.Server();
    const req = new Req(mock);

    req.on('connection', () => {
        t.ok(true);
        t.end();
    });

    mock.emitConnection();
});

tap.test('SocketMsgReq.on("disconnection") - transport emits "disconnection" event - should emit "disconnection" event', (t) => {
    const mock = new event.Server();
    const req = new Req(mock);

    req.on('disconnection', () => {
        t.ok(true);
        t.end();
    });

    mock.emitDisconnection();
});

tap.test('SocketMsgReq.on("close") - transport emits "close" event - should emit "close" event', (t) => {
    const mock = new event.Server();
    const req = new Req(mock);

    req.on('close', () => {
        t.ok(true);
        t.end();
    });

    mock.emitClose();
});

tap.test('SocketMsgReq.on("error") - transport emits "error" event - should emit "error" event', (t) => {
    const mock = new event.Server();
    const req = new Req(mock);

    req.on('error', (error) => {
        t.equal(error, 'foo');
        t.end();
    });

    mock.emitError('foo');
});

tap.test('SocketMsgReq.on("bind") - transport emits "bind" event - should emit "bind" event', (t) => {
    const mock = new event.Server();
    const req = new Req(mock);

    req.on('bind', (address) => {
        t.equal(address, 'bar');
        t.end();
    });

    mock.emitBind('bar');
});
