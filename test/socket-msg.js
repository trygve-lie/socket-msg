'use strict';

const SocketMsg = require('../');
const tap = require('tap');

/**
 * Constructor
 */

tap.test('SocketMsg() - object type - should be SocketMsg', (t) => {
    const smsg = new SocketMsg();
    t.equal(Object.prototype.toString.call(smsg), '[object SocketMsg]');
    t.end();
});

tap.test('SocketMsg() - without id - should set default id', (t) => {
    const smsg = new SocketMsg();
    t.ok(smsg.id);
    t.end();
});

tap.test('SocketMsg() - with id - should set default id', (t) => {
    const id = 'foo';
    const smsg = new SocketMsg({ id });
    t.equal(smsg.id, id);
    t.end();
});
