'use strict';

const tcp = require('../../lib/transports/tcp');
const tap = require('tap');

let PORT = 9500;

const RECONNECT_SHORT = {
    randomisationFactor: 0,
    initialDelay: 2,
    failAfter: 2,
    maxDelay: 10,
};

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
    const client = new tcp.Client();
    const port = PORT++;

    client.on('error', () => {

    });

    server.bind({ port }, (error, address) => {
        server.close(() => {
            client.connect(address, (err) => {
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
            client.send(Buffer.from('foo'));
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

tap.test('SocketMsgTcpServer.on("bind") - bind server - should emit bind event with server address', (t) => {
    const server = new tcp.Server();
    const port = PORT++;

    server.on('bind', (address) => {
        server.close();
        t.type(address, 'object');
        t.equal(address.port, port);
        t.end();
    });

    server.bind({ port }, () => {});
});

tap.test('SocketMsgTcpServer.on("close") - close server - should emit close event', (t) => {
    const server = new tcp.Server();
    const port = PORT++;

    server.on('close', () => {
        t.ok(true);
        t.end();
    });

    server.bind({ port }, () => {
        server.close();
    });
});

tap.test('SocketMsgTcpServer.on("connection") - client connects to server - should emit connection event with uuid', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    server.on('connection', (uuid) => {
        t.ok(uuid);
        t.end();
    });

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            client.close(() => {
                server.close();
            });
        });
    });
});

tap.test('SocketMsgTcpServer.on("disconnection") - client disconnects from server - should emit disconnection event with uuid', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    server.on('disconnection', (uuid) => {
        t.ok(uuid);
        t.end();
    });

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            client.close(() => {
                server.close();
            });
        });
    });
});

tap.test('SocketMsgTcpServer.roundrobin() - roundsobin message - should distribute message in round robin fashion', (t) => {
    const server = new tcp.Server();
    const clientA = new tcp.Client();
    const clientB = new tcp.Client();
    const port = PORT++;

    const a = [];
    const b = [];

    clientA.on('message', (msg) => {
        a.push(msg.toString());
        if (a.length === 3) {
            t.equal(a[0], 'a');
            t.equal(a[1], 'c');
            t.equal(a[2], 'e');
        }
    });

    clientB.on('message', (msg) => {
        b.push(msg.toString());
        if (b.length === 3) {
            t.equal(b[0], 'b');
            t.equal(b[1], 'd');
            t.equal(b[2], 'f');
        }
    });

    server.bind({ port }, (error, address) => {
        clientA.connect(address, () => {
            clientB.connect(address, () => {
                server.roundrobin('a');
                server.roundrobin('b');
                server.roundrobin('c');
                server.roundrobin('d');
                server.roundrobin('e');
                server.roundrobin('f');
                clientA.close(() => {
                    clientB.close(() => {
                        server.close(() => {
                            t.end();
                        });
                    });
                });
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
    client.on('error', () => {

    });

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
            t.false(client.socket.destroyed);
            client.close((status) => {
                t.ok(status);
                t.true(client.socket.destroyed);
                server.close(() => {
                    t.end();
                });
            });
        });
    });
});

tap.test('SocketMsgTcpClient.send() - send message - should be sent to server', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            client.send(Buffer.from('foo'), 'bar', 'xyz');
        });
    });

    server.on('message', (msg, uuid, channel, trackId) => {
        client.close(() => {
            server.close(() => {
                t.equal(msg.toString(), 'foo');
                t.ok(uuid);
                t.equal(channel.toString(), 'bar');
                t.equal(trackId.toString(), 'xyz');
                t.end();
            });
        });
    });
});

tap.test('SocketMsgTcpClient.on("message") - receives data from server - should emit message event with message', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    client.on('message', (msg, channel, trackId) => {
        client.close(() => {
            server.close(() => {
                t.equal(msg.toString(), 'foo');
                t.equal(channel.toString(), 'bar');
                t.equal(trackId.toString(), 'xyz');
                t.end();
            });
        });
    });

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            server.broadcast(Buffer.from('foo'), 'bar', 'xyz');
        });
    });
});

tap.test('SocketMsgTcpClient.on("connection") - connects to a server - should emit connection event', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    client.on('connection', () => {
        t.ok(true);
        t.end();
    });

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            client.close(() => {
                server.close(() => {

                });
            });
        });
    });
});

tap.test('SocketMsgTcpClient.on("disconnection") - disconnect by server - should emit disconnection event', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    client.on('error', () => {

    });

    client.on('disconnection', () => {
        t.ok(true);
        client.close(() => {
            t.end();
        });
    });

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            server.close(() => {

            });
        });
    });
});

tap.test('SocketMsgTcpClient.on("close") - force close connections to servers - should emit close event', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client();
    const port = PORT++;

    client.on('close', () => {
        t.end();
    });

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            client.close(() => {
                server.close(() => {

                });
            });
        });
    });
});

tap.test('SocketMsgTcpClient.on("reconnect *") - lost connection from server - should emit reconnect backoff and reconnect failed events', (t) => {
    const server = new tcp.Server();
    const client = new tcp.Client(RECONNECT_SHORT);
    const port = PORT++;

    client.on('error', () => {

    });

    client.on('reconnect backoff', (attempt, delay) => {
        t.type(attempt, 'number');
        t.type(delay, 'number');
    });

    client.on('reconnect failed', () => {
        t.ok(true);
        t.end();
    });

    server.bind({ port }, (error, address) => {
        client.connect(address, () => {
            server.close(() => {

            });
        });
    });
});
