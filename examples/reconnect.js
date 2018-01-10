'use strict';

const SocketMsg = require('../');

const address = {
    host: 'localhost',
    port: 8124,
};

const smsg = new SocketMsg();

// Pub server
const pub = smsg.tcp('pub');
pub.bind(address);


// Sub clients
const sub = smsg.tcp('sub');
sub.connect(address);

// Close pub server
setTimeout(() => {
    pub.close();
}, 1000);

// Start pub server
setTimeout(() => {
    pub.bind(address);
}, 3000);

// Close pub server
setTimeout(() => {
    pub.close();
}, 5000);

// Start pub server
setTimeout(() => {
    pub.bind(address);
}, 7000);


// Close sub client
setTimeout(() => {
    sub.close();
}, 9000);

// Close pub server
setTimeout(() => {
    pub.close();
}, 10000);
