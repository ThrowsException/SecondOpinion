"use strict";

module.exports = function(db, cb) {
    db.define('physician', {
        name: String
     });
     
     return cb();
};
