'use strict';

const SocketMsg = require('../');

const smsg = new SocketMsg();

// Pub server
const pub = smsg.tcp('pub');
pub.bind({
    host: 'localhost',
    port: 8124,
});

// Send messages on pub server
setTimeout(() => {
    pub.send('boooo');
}, 200);
setTimeout(() => {
    pub.send('hoooo');
}, 600);

// Sub clients
const subA = smsg.tcp('sub');
subA.connect({
    host: 'localhost',
    port: 8124,
});

const subB = smsg.tcp('sub');
subB.connect({
    host: 'localhost',
    port: 8124,
});

// Close sub clients
setTimeout(() => {
    subB.close();
}, 400);

// Close pub server
setTimeout(() => {
    pub.close();
}, 800);
