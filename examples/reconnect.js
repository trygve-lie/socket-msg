'use strict';

const SocketMsg = require('../');
const address = {
    port: 7000,
};

const reconnect = async () => {
    const smsg = new SocketMsg();
    const pub = smsg.tcp('pub');
    const sub = smsg.tcp('sub');

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
