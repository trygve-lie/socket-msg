'use strict';

const SocketMsg = require('../');

const smsg = new SocketMsg();

const pubsub = async () => {
    const pub = smsg.tcp('pub');
    const sub1 = smsg.tcp('sub');
    const sub2 = smsg.tcp('sub');
    const sub3 = smsg.tcp('sub');

    sub1.on('message', (msg) => {
        console.log(`subscriber 1 got message from publisher: ${msg}`);
    });

    sub2.on('message', (msg) => {
        console.log(`subscriber 2 got message from publisher: ${msg}`);
    });

    sub3.on('message', (msg) => {
        console.log(`subscriber 3 got message from publisher: ${msg}`);
    });

    const paddr = await pub.bind();
    console.log(`publisher bound to port ${paddr.port}`);

    const saddr1 = await sub1.connect(paddr);
    const saddr2 = await sub2.connect(paddr);
    const saddr3 = await sub3.connect(paddr);
    console.log(`subscribers connected to port ${paddr.port}`);

    const pcli = pub.send('ping');
    console.log(`publiser published message to ${pcli} subscribers`);

    await sub1.close();
    await sub2.close();
    await sub3.close();
    await pub.close();
};

pubsub();
