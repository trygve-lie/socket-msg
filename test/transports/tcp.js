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
    const client = new tcp.Client();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            t.equal(server.connections.size, 1);
            client.close(() => {
                server.close(() => {
                    t.equal(server.connections.size, 0);
                    t.end();
                });
            });
        });
    });
});

tap.test('SocketMsgTcpServer.broadcast() - broadcast message - should be sent to all clients', (t) => {
    const server = new tcp.Server();
    const cliA = new tcp.Client();
    const cliB = new tcp.Client();
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
                cliA.close(() => {
                    cliB.close(() => {
                        server.close(() => {
                            t.equal(gets, 2);
                            t.equal(msg, 'foo');
                            t.end();
                        });
                    });
                });
            }
            gets++;
        };

        cliA.connect(address, () => {
            sendMessage();
        });

        cliA.on('message', (msg) => {
            gotMessage(msg.toString());
        });

        cliB.connect(address, () => {
            sendMessage();
        });

        cliB.on('message', (msg) => {
            gotMessage(msg.toString());
        });
    });
});

tap.test('SocketMsgTcpServer.on("message") - receives data from client - should emit message event with message and client uuid', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            client.broadcast(Buffer.from('foo'));
        });
    });

    server.on('message', (msg, uuid) => {
        client.close(() => {
            server.close(() => {
                t.equal(msg.toString(), 'foo');
                t.ok(uuid);
                t.end();
            });
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

tap.test('SocketMsgTcpClient() - no strategy argument - should set default strategy on "this.strategy"', (t) => {
    const client = new tcp.Client();
    t.type(client.strategy, 'object');
    t.equal(client.strategy.randomisationFactor, 0);
    t.equal(client.strategy.initialDelay, 2);
    t.equal(client.strategy.maxDelay, 1000);
    t.end();
});

tap.test('SocketMsgTcpClient() - custom strategy argument - should set default strategy on "this.strategy"', (t) => {
    const client = new tcp.Client({
        randomisationFactor: 1,
        initialDelay: 10,
        maxDelay: 6000
    });
    t.type(client.strategy, 'object');
    t.equal(client.strategy.randomisationFactor, 1);
    t.equal(client.strategy.initialDelay, 10);
    t.equal(client.strategy.maxDelay, 6000);
    t.end();
});

tap.test('SocketMsgTcpClient() - connect to non running server - should call callback - first argument is an error object, second is "null"', (t) => {
    const client = new tcp.Client();
    const port = PORT++;

    client.connect({ port, host: 'localhost' }, (error, address) => {
        t.type(error, 'object');
        t.type(address, 'null');
        t.end();
    });
});

tap.test('SocketMsgTcpClient() - connect to running server - should call callback - first argument is "null", second is address object', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        client.connect(address, (err, addr) => {
            t.type(err, 'null');
            t.type(addr, 'object');
            client.close(() => {
                server.close(() => {
                    t.end();
                });
            });
        });
    });
});

tap.test('SocketMsgTcpClient() - close connection - should close connection', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            t.equal(client.connections.size, 1);
            client.close((status) => {
                t.ok(status);
                t.equal(client.connections.size, 0);
                server.close(() => {
                    t.end();
                });
            });
        });
    });
});

tap.test('SocketMsgTcpClient.broadcast() - broadcast message - should be sent to server', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            client.broadcast(Buffer.from('foo'));
        });
    });

    server.on('message', (msg, uuid) => {
        client.close(() => {
            server.close(() => {
                t.equal(msg.toString(), 'foo');
                t.ok(uuid);
                t.end();
            });
        });
    });
});

tap.test('SocketMsgTcpClient.on("message") - receives data from server - should emit message event with message and server uuid', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            server.broadcast(Buffer.from('foo'));
        });
    });

    client.on('message', (msg, uuid) => {
        client.close(() => {
            server.close(() => {
                t.equal(msg.toString(), 'foo');
                t.ok(uuid);
                t.end();
            });
        });
    });
});
