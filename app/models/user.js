'use strict';

module.exports = function(db, cb) {
    db.define('user', {
        username: { type: 'text', size: 255 },
        password: { type: 'text', required: true },
        salt: { type: 'text', required: true },
        role: { type: 'text'}
     });

     return cb();
};
