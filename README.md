# socket-msg

[![Dependencies](https://img.shields.io/david/trygve-lie/socket-msg.svg?style=flat-square)](https://david-dm.org/trygve-lie/socket-msg)[![Build Status](http://img.shields.io/travis/trygve-lie/socket-msg/master.svg?style=flat-square)](https://travis-ci.org/trygve-lie/socket-msg)

Possible API:

PubSub

Publish to all connected subscribers

```js
const smsg = new SocketMsg();
const pub = smsg.tcp('pub');
const paddr = await pub.bind();
pub.send('channel', 'Message');
stream.pipe(pub);

const sub = smsg.tcp('sub');
const saddr = await sub.connect(paddr);
sub.on('message', (channel, msg) => {

});
sub.pipe(stream);

const sdead = await sub.close();
const pdead = await pub.close();
```

Req/rep

```js
const req = smsg.tcp('req');
req.connect(3000);
req.send('channel', 'Message', (res) => {
    console.log(res);
});
stream.pipe(req).pipe(stream);

const smsg = new SocketMsg();
const rep = smsg.tcp('rep');
rep.bind(3000);
rep.on('message', (channel, msg, res) => {
    res.send('Message');
});
rep.pipe(stream).pipe(rep);

```



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
