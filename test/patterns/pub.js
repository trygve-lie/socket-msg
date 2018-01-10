'use strict';

const tcp = require('../../lib/transports/tcp');
const Pub = require('../../lib/patterns/pub');
const tap = require('tap');

/**
 * Constructor
 */

tap.test('SocketMsgPub() - object type - should be SocketMsgPub', (t) => {
    const pub = new Pub(tcp);
    t.equal(Object.prototype.toString.call(pub), '[object SocketMsgPub]');
    t.end();
});
