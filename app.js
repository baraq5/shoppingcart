var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expresshbs=require('express-handlebars');
var mongoose= require('mongoose');
var session= require('express-session');
var passport = require('passport');
var  flash = require('connect-flash');
var validator= require('express-validator');
var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var users = require('./routes/users');
var config = require('./config/database');

var app = express();
mongoose.Promise=global.Promise;
mongoose.connect(config.database, { useMongoClient: true, promiseLibrary: global.Promise });
require('./config/passport');


var db= mongoose.connection;
//Mongo connection
db.once('open',function(){
    console.log('Mongo Databases Connected');
});
//Mongo error
db.eventNames('error',function(err){
    console.log(err);
});

var Product = require('./models/products');




// view engine setup
app.engine('.hbs',expresshbs({defaultLayout:'layout',extname:'.hbs'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret:'MySuperb Secret',
  resave:false,
  saveUninitialized:false,
  store: new MongoStore({mongooseConnection:mongoose.connection}),
  cookie:{maxAge:180*60*1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next){
  res.locals.loggedin=req.isAuthenticated();
  res.locals.session=req.session;
  next();
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
