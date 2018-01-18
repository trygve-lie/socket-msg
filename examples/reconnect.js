'use strict';

const SocketMsg = require('../');

const address = {
    port: 7700,
};

const reconnect = async () => {
    const smsg = new SocketMsg();
    const pub = smsg.tcp('pub');
    const sub = smsg.tcp('sub');

    sub.on('error', (error) => {
        // console.log(error);
    });

    sub.on('reconnect backoff', (uuid, attempt, delay) => {
        console.log(`Waiting ${delay}ms to do reconnect attempt ${attempt + 1}`);
    });

    sub.on('reconnect failed', (uuid) => {
        console.log('Reconnect failed');
    });

    sub.on('connection', (uuid) => {
        console.log('Got connection');
    });

    sub.on('disconnection', (uuid) => {
        console.log('Lost connection');
    });

    sub.on('close', () => {
        console.log('Connection force closed');
    });

    await pub.bind(address);
    await sub.connect(address);

    setTimeout(async () => {
        await pub.close();
    }, 2000);

    setTimeout(async () => {
        await pub.bind(address);
    }, 4000);

    setTimeout(async () => {
        await pub.close();
    }, 6000);

    setTimeout(async () => {
        await pub.bind(address);
    }, 8000);

    setTimeout(async () => {
        await sub.close();
        await pub.close();
    }, 10000);
};

reconnect();
