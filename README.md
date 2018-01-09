# socket-msg

Possible API:

PubSub

```js
const smsg = new SocketMsg();
const pub = smsg.tcp('pub');
pub.bind(3000);
pub.send('channel', 'Message');
stream.pipe(pub);

const sub = smsg.tcp('sub');
sub.connect(3000);
sub.on('message', (channel, msg) => {

});
sub.pipe(stream);
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
