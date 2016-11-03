var User = require('../models/user');
var userService = require('./users');
var cred = require('credential')({work: 0.3})
var async = require('async')
var secrets = require('../secrets')
var _ = require('lodash')
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

exports.authenticate = function(body, callback) {
  // Create a new instance of the User model
  console.log('login::authenticate')

/*
  if (body.action == 'login') {
    return login(body, token, cb)
  }

 if (body.action == 'reset_password') {
   return resetPassword(body, token, cb)
 }

 if (body.action == 'mfa_response') {
   return validateMfa(body, token, cb)
 }
*/

  login(body, callback)

}


login = function(body, callback) {

  console.log("find by username: " + body.username)
  var user;

  async.waterfall([
    // Get tenant id from site_name

    function(next) {
      userService.getUserByName(body.username, function (err, r) {
        if (err) {
          console.log(err)
          callback(500, {error: 'Internal error'})
          next(err)
        } else if (_.isEmpty(r)) {
          callback(401, {error: 'Authentication failed'})
          next(new Error())
        } else {
          next(null, r)
        }
      })
    },
    function(u, next) {
      user = u[0];
      console.log('Success - found user by username')
      cred.verify(user.password, body.password,
        function(err, valid) {
          if (err || !valid) {
            callback(401, {error: 'Login failed'})
            next(err || new Error())
          } else {
            console.log('Success - found user: ' + user.username)
            console.log('User email endpoint: ' + user.email)
            next(null)
          }
        })
    }
  ], function(err) {
    sendToken(err, user, callback)
  })
}

// Create and send JWT (token) back to client for future authenticating
function sendToken(err, user, cb) {
  if (! err) {
    // User is fully authed at this point
    console.log('sendToken() - Return user web token')

    // JWT Payload has user information
    var jwt_payload = { user_id: user.id }

    cb(200, {
      token: sign(jwt_payload, secrets.user),
      auth_state: 'success',
      user: user
    }, 'Test')
  }
}

// JWT sign prepends header to token before it signs it
function sign(payload, conf) {
  return jwt.sign(payload, conf.secret, conf.options)
}

