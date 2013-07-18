"use strict";

module.exports = function(db, cb) {
    db.define('patient', {
        name: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        phone: String
     });
     
     return cb();
};
