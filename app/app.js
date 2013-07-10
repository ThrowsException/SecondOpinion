
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , https = require('https')
  , lessMiddleware = require('less-middleware')
  , orm = require('orm')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

/*app.use(orm.express("pg://postgres@127.0.0.1:5432/second_opinion", {
    define: function (db, models) {
        models.forms = db.define("forms", {
            name: String,
            reason: String
         });

         db.on('connect', function(err, db) {
            if(err) {
                console.log(err);
            }
            else {
                console.log("Connected");
            }
         });
    }
}));*/

app.use(lessMiddleware({src: __dirname + '/public'}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var opts = {
  database : "second_opinion",
  protocol : "postgres",
  host     : "127.0.0.1",
  port     : 5432,         // optional, defaults to database default
  user     : "throwsexception",
  password : "",
  query    : {
    //pool     : true|false,   // optional, false by default
    //debug    : true|false,   // optional, false by default
    //strdates : true|false    // optional, false by default
  }
};
orm.connect(opts, function (err, db) {
    if(err) {
        console.log(err);
    }
    var Form = db.define('form', {
        name    : String,
        reason  : String
    });

    Form.sync();
    console.log("connected");
});


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/saveForm', function(req, res) {
        orm.connect(opts, function (err, db) {
            if(err) {
                console.log(err);
            }
            if(err) {
                console.log(err);
            }
            var Form = db.define('form', {
                name    : String,
                reason  : String
            });

            var form = new Form({name: req.body.NameInput, reason: req.body.Reason});
            form.save(function(err, form) {});
        });
        res.redirect('/');
    });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
