'use strict';

const SocketMsg = require('../');

const smsg = new SocketMsg();

const reqrep = async () => {
    const req = smsg.tcp('req');
    const rep1 = smsg.tcp('rep');
    const rep2 = smsg.tcp('rep');
    const rep3 = smsg.tcp('rep');

    rep1.on('message', (msg, callback) => {
        console.log(`replier 1 got message from requester: ${msg}`);
        callback(`${msg} pong 1`);
    });

    rep2.on('message', (msg, callback) => {
        console.log(`replier 2 got message from requester: ${msg}`);
        callback(`${msg} pong 2`);
    });

    rep3.on('message', (msg, callback) => {
        console.log(`replier 3 got message from requester: ${msg}`);
        callback(`${msg} pong 3`);
    });


    const qaddr = await req.bind();
    console.log(`requester bound to port ${qaddr.port}`);

    const paddr1 = await rep1.connect(qaddr);
    const paddr2 = await rep2.connect(qaddr);
    const paddr3 = await rep3.connect(qaddr);
    console.log(`repliers connected to port ${qaddr.port}`);

    const qcli1 = await req.send('ping');
    console.log(`requester got message from replier: ${qcli1}`);

    const qcli2 = await req.send('ping');
    console.log(`requester got message from replier: ${qcli2}`);

    const qcli3 = await req.send('ping');
    console.log(`requester got message from replier: ${qcli3}`);

    await rep1.close();
    await rep2.close();
    await rep3.close();
    await req.close();
};

reqrep();
