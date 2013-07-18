"use strict";

module.exports = function (db, cb) {
    db.load("./user", function (err) { if (err) { return cb(err); }});
    db.load("./visit", function (err) { if (err) { return cb(err); }});
    db.load("./patient", function (err) { if (err) { return cb(err); }});
    db.load("./physician", function (err) { if (err) { return cb(err); }});
    
    return cb();
};
