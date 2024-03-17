var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');
// var User = require('../models/user');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user'); //  have a User model defined
require('dotenv').config({path: './.env'});


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/oauth2/redirect/google',
  scope: ['profile']
}, async function(accessToken, refreshToken, profile, cb) {
  try {
    // Check if the user exists in the database
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // If user doesn't exist, create a new user
      user = new User({
        googleId: profile.id,
        name: profile.displayName
      });
      await user.save();
    }

    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
}));


var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

module.exports = router;
