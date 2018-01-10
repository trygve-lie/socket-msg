'use strict';

const tcp = require('../../lib/transports/tcp');
const Sub = require('../../lib/patterns/sub');
const tap = require('tap');

/**
 * Constructor
 */

tap.test('SocketMsgSub() - object type - should be SocketMsgSub', (t) => {
    const sub = new Sub(tcp);
    t.equal(Object.prototype.toString.call(sub), '[object SocketMsgSub]');
    t.end();
});
