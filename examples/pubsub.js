'use strict';

const SocketMsg = require('../');

const smsg = new SocketMsg();

const pubsub = async () => {
    const pub = smsg.tcp('pub');
    const sub = smsg.tcp('sub');

    sub.on('message', (msg) => {
        console.log('sub msg:', msg);
    });

    const paddr = await pub.bind();
    console.log(paddr);

    const saddr = await sub.connect(paddr);
    console.log(saddr);

    const pcli = pub.send('hello from publisher');
    console.log('sent message to num clients', pcli);

    const sdead = await sub.close();
    const pdead = await pub.close();
    console.log(sdead, pdead);
};

pubsub();
