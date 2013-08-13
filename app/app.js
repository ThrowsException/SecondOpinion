var express = require('express')
  , routes = require('./routes')
  , admin = require('./routes/admin')
  , http = require('http')
  , https = require('https')
  , crypto = require('crypto')
  , lessMiddleware = require('less-middleware')
  , orm = require('orm')
  , path = require('path')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var databaseConnection = "pg://postgres@127.0.0.1:5432/second_opinion";
var cookieSecret = 'secopapp89!';
var app = express();

//  Setup node orm for use with postgres
//  probably should be using some kind of config file for this
app.use(orm.express(databaseConnection, {
  define: function (db, models) {
    db.load('./models', function(err) {
        if(err) {
            console.log(err);
        }

        models.user = db.models.user;
        models.patient = db.models.patient;
        models.physician = db.models.physician;
        models.visit = db.models.visit;

    });
  }
}));

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  orm.connect(databaseConnection, function(err, db) {
    var User = db.define("user", { username: String });

    User.find({ id: id }, function(err, user) {
      if (err) { return done(err); }
      if (!user[0]) { return done(err); }

      return done(null, user[0]);
    });
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    orm.connect(databaseConnection, function(err, db) {
    var User = db.define("user", { username: String, password: String, salt: String });

      User.find({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user[0]) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        crypto.pbkdf2(password, user[0].salt, 10000, 512, function(err, derivedKey) {
          password = derivedKey.toString('base64');
          console.log(password);
          if (!user[0].password || user[0].password !== password) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          else {
            return done(null, user[0]);
          }
        });
      });
    });
  }
));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(lessMiddleware({src: __dirname + '/public'}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.cookieSession({ secret: cookieSecret, cookie: { maxAge: 24 * 60 * 60 * 1000 }}));
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/admin', ensureAuthenticated, function(req, res){
  req.models.visit.find({}, ["date", "Z"], function(err, visits){
    res.render('admin', { visits: visits });
  });
});

app.get('/:form', function(req, res) {

    var forms = [];
    forms['brain_tumor'] = 'Brain Tumor';
    forms['spine_health'] = 'Spine Health';

    res.render(req.params.form, { form: forms[req.params.form] } );
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/admin',
                                   failureRedirect: '/',
                                   failureFlash: false })
);

app.post('/saveForm', function(req, res) {
  req.models.visit.create({
    diagnoses: req.body.diagnoses,
    questions: req.body.questions,
    reason: req.body.reason,
    date: new Date(),
    signature_date: req.body.signature_date,
    disclaimer_signature: req.body.disclaimer_signature,
    disclaimer_date: req.body.disclaimer_date
  }, function(err, visit) {
      console.log(err);
    }
  );

  req.models.patient.create({
    name: req.body.name,
    address: req.body.address,
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

  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}
