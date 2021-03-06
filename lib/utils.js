'use strict';

const crypto = require('crypto');

module.exports.uuid = (id) => {
    return id || crypto.randomBytes(3 * 4).toString('base64');
};

module.exports.strategy = (strategy) => {
    return Object.assign({
        randomisationFactor: 0,
        initialDelay: 2,
        failAfter: 1000,
        maxDelay: 1000,
    }, strategy);
};
