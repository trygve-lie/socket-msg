'use strict';

const crypto = require('crypto');

module.exports.uuid = (id) => {
    return crypto.randomBytes(3 * 4).toString('base64');
};
