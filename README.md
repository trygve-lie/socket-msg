# socket-msg

[![Dependencies](https://img.shields.io/david/trygve-lie/socket-msg.svg?style=flat-square)](https://david-dm.org/trygve-lie/socket-msg)[![Build Status](http://img.shields.io/travis/trygve-lie/socket-msg/master.svg?style=flat-square)](https://travis-ci.org/trygve-lie/socket-msg) [![Greenkeeper badge](https://badges.greenkeeper.io/trygve-lie/socket-msg.svg)](https://greenkeeper.io/)

## API:

### PubSub:

Publish to all connected subscribers.

```js
const smsg = new SocketMsg();

const pub = smsg.tcp('pub');
const paddr = await pub.bind();
pub.send('channel', 'Message');
stream.pipe(pub);

const sub = smsg.tcp('sub');
const saddr = await sub.connect([paddr]);
sub.on('message', (channel, msg) => {

});
sub.pipe(stream);

const sdead = await sub.close();
const pdead = await pub.close();
```

### ReqRep:

Round robin request connected repliers.

```js
const smsg = new SocketMsg();

const rep = smsg.tcp('rep');
const rpaddr = await rep.bind();
rep.on('message', (channel, msg, res) => {
    res.send('Message');
});
rep.pipe(stream).pipe(rep);

const req = smsg.tcp('req');
const rqaddr = await req.connect([rpaddr]);
const rqmsg = await req.send('channel', 'Message');
/*
req.send('channel', 'Message', (resMsg) => {
    console.log(resMsg);
});
*/

stream.pipe(req).pipe(stream);

const rpdead = await rep.close();
const rqdead = await req.close();
```

### PushPull (pipeline):

Round robin push messages to connected pullers. Both push and pull can both `.bind()` and `.connect()`:

```js
const smsg = new SocketMsg();

const pull = smsg.tcp('pull');
const pladdr = await pull.connect([psaddr]);
pull.on('message', (channel, msg) => {

});

const push = smsg.tcp('push');
const psaddr = await push.bind();
push.send('channel', 'Message');

const pldead = await pull.close();
const prdead = await push.close();
```



## Server events:

 * `connection` - `uuid` - when remote client connects
 * `disconnection` - `uuid` - when remote client disconnects
 * `message` - `message`, `uuid` - message from remote client
 * `bind` - `address` - when server binds
 * `close` - when server closes
 * `error` - `error` - when an error occur

## Client events:

 * `connection` - `uuid` - when client connects to remote server
 * `disconnection` - `uuid` - when client disconnects from remote server
 * `reconnect backoff` - `uuid`, `attempt`, `delay` - when client looses connection to server
 * `reconnect failed` - `uuid` - when client reconnection attempts to server is exceeded
 * `message` - `message`, `uuid` - message from remote server
 * `close` - when client is force closed
 * `error` - `error`, `uuid` - when an error occur



## node.js compabillity

This module is written in ES6 and uses some functions only found in node.js 8.2
and newer. This module will not function with older than 8.2 versions of node.js.



## error handling

This module does not handle errors for you, so you must handle errors on
whatever streams you pipe into this module. This is a general rule when
programming with node.js streams: always handle errors on each and every stream.

We recommend using [`end-of-stream`](https://npmjs.org/end-of-stream) or [`pump`](https://npmjs.org/pump)
for writing error tolerant stream code.



## License

The MIT License (MIT)

Copyright (c) 2017 - Trygve Lie - post@trygve-lie.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
