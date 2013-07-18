"use strict";

module.exports = function(db, cb) {
    db.define('visit', {
        signature_date: Date,
        diagnoses: String,
        questions: String,
        reason: String,
        date: Date,
        disclaimer_signature: String,
        disclaimer_date: String
    });
    
    return cb();
};
