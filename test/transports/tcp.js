'use strict';

const tcp = require('../../lib/transports/tcp');
const tap = require('tap');

/**
 * SocketMsgTcpServer - Constructor
 */

tap.test('SocketMsgTcpServer() - object type - should be SocketMsgTcpServer', (t) => {
    const server = new tcp.Server();
    t.equal(Object.prototype.toString.call(server), '[object SocketMsgTcpServer]');
    t.end();
});






/**
 * SocketMsgTcpClient - Constructor
 */

tap.test('SocketMsgTcpClient() - object type - should be SocketMsgTcpClient', (t) => {
    const client = new tcp.Client();
    t.equal(Object.prototype.toString.call(client), '[object SocketMsgTcpClient]');
    t.end();
});

