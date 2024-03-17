var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
const User = require('./models/user');
var MongoStore = require('connect-mongo');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
require('dotenv').config({path: './.env'});

var app = express();

mongoose.connect(process.env.MONGO_URL, {
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Session setup with MongoDB store
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL, // Replace with your MongoDB Atlas URI
    ttl: 60 * 60 * 24, // Session TTL (optional)
    autoRemove: 'native' // Automatically remove expired sessions (optional)
  })
}));
app.use(passport.authenticate('session'));

passport.serializeUser(function(user, cb) {
  cb(null, user.id); // Serialize the user by storing only the user id
});

passport.deserializeUser(function(id, cb) {
  User.findById(id)
    .then(user => {
      if (!user) {
        return cb(null, false); // User not found
      }
      cb(null, user); // Deserialize the user found
    })
    .catch(err => {
      cb(err); // Pass any errors to the callback
    });
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
