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

app.use(orm.express("pg://postgres@127.0.0.1:5432/second_opinion", {
    define: function (db, models) {
         models.patient = db.define("patient", {
            name: String,
            address: String,
            city: String,
            State: String,
            Zip: String,
            phone: String,
         });
         
         models.physician = db.define("physician", {
            name: String
         });
         
         models.visit = db.define("visit", {
            signature_date: Date,
            diagnoses: String,
            questions: String,
            reason: String,
            date: Date,
            disclaimer_signature: String,
            disclaimer_date: String
         });
         
         db.sync();
    }
}));

app.use(lessMiddleware({src: __dirname + '/public'}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/saveForm', function(req, res) { 
            debugger;                
            req.models.visit.create({
                diagnoses: req.body.diagnoses, 
                questions: req.body.questions, 
                reason: req.body.reason, 
                signature_date: req.body.signature_date,
                disclaimer_signature: req.body.disclaimer_signature,
                disclaimer_date: req.body.disclaimer_date
            }, function(err, visit) {
                    console.log(err);
                }
            );
            
            req.models.patient.create({
                name: req.body.name,
                address: req.body.adress,
                city: req.body.city,
                state: req.body.state,
                zip: req.body.zip,
                phone: req.body.phone
            }, function(err, patient) {
                    console.log(err);
                }
            );
            
            req.models.physician.create({
                name: req.body.physician_name
            }, function(err, physician) {
                    console.log(err);
                }
            );
            
        res.send('Thanks Jeff');
    });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
