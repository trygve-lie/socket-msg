'use strict';

const tcp = require('../../lib/transports/tcp');
const tap = require('tap');
const net = require('net');

let PORT = 9500;

/**
 * SocketMsgTcpServer - Constructor
 */

tap.test('SocketMsgTcpServer() - object type - should be SocketMsgTcpServer', (t) => {
    const server = new tcp.Server();
    t.equal(Object.prototype.toString.call(server), '[object SocketMsgTcpServer]');
    t.end();
});

tap.test('SocketMsgTcpServer.bind() - bind on available port - should call callback with address object', (t) => {
    const server = new tcp.Server();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        server.close();
        t.type(error, 'null');
        t.type(address, 'object');
        t.equal(address.port, port);
        t.end();
    });
});

tap.test('SocketMsgTcpServer.bind() - bind on same port multiple times - should call callback with error the second time', (t) => {
    const serverA = new tcp.Server();
    const serverB = new tcp.Server();
    const port = PORT++;

    serverA.bind({ port }, (error, address) => {
        t.type(error, 'null');
        t.type(address, 'object');

        serverB.bind({ port }, (err, addr) => {
            serverA.close();
            t.type(err, 'object');
            t.type(addr, 'null');
            t.end();
        });
    });
});

tap.test('SocketMsgTcpServer.close() - close running server - should stop server', (t) => {
    const server = new tcp.Server();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        server.close(() => {
            net.createConnection(address).on('error', (err) => {
                t.type(err, 'object');
                t.end();
            });
        });
    });
});

tap.test('SocketMsgTcpServer.close() - with callback - should call callback with first argument to "true"', (t) => {
    const server = new tcp.Server();
    const port = PORT++;

    server.bind({ port }, () => {
        server.close((state) => {
            t.ok(state);
            t.end();
        });
    });
});

tap.test('SocketMsgTcpServer.close() - close running server - should clear connection pool', (t) => {
    const server = new tcp.Server();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        net.createConnection(address, () => {
            t.equal(server.connections.size, 1);
            server.close(() => {
                t.equal(server.connections.size, 0);
                t.end();
            });
        });
    });
});

tap.test('SocketMsgTcpServer.broadcast() - broadcast message - should be sent to all clients', (t) => {
    const server = new tcp.Server();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        let cons = 0;
        let gets = 0;

        const sendMessage = () => {
            if (cons === 1) {
                server.broadcast('foo');
            }
            cons++;
        };

        const gotMessage = (msg) => {
            if (gets === 1) {
                server.close(() => {
                    t.equal(gets, 2);
                    t.equal(msg, 'foo');
                    t.end();
                });
            }
            gets++;
        };

        net.createConnection(address, () => {
            sendMessage();
        }).on('data', (msg) => {
            gotMessage(msg.toString());
        });

        net.createConnection(address, () => {
            sendMessage();
        }).on('data', (msg) => {
            gotMessage(msg.toString());
        });
    });
});

tap.test('SocketMsgTcpServer.on("message") - receives data from client - should emit message event with message and client uuid', (t) => {
    const server = new tcp.Server();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        const client = net.createConnection(address, () => {
            client.write(Buffer.from('foo'));
        });
    });

    server.on('message', (msg, uuid) => {
        server.close(() => {
            t.equal(msg.toString(), 'foo');
            t.ok(uuid);
            t.end();
        });
    });
});




/**
 * SocketMsgTcpClient - Constructor
 */

tap.test('SocketMsgTcpClient() - object type - should be SocketMsgTcpClient', (t) => {
    const client = new tcp.Client();
    t.equal(Object.prototype.toString.call(client), '[object SocketMsgTcpClient]');
    t.end();
});

