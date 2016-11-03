var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var assert = require('assert')
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var secrets = require('./secrets')

var users = require('./services/users');
var login = require('./services/login');

// Connect to the MongoDB
mongoose.connect('mongodb://localhost:27017/node-app');

// Use Express web app framework for routing
var app = express();

app.use(logger('dev'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var router = express.Router();

// route middleware that will happen on every request
app.use(function(req, res, next) {

  // Add token to request object
  var token = getToken(req)
  req.token = token

  if (req.url == '/authenticate') {
    console.log('router middleware - authenticate')
    next()
    return
  }

  // Not used in Production - just to setup test users
  if (req.url == '/adminCreate') {
    console.log('router middleware - admin create user')
    next()
    return
  }

  if (! token) {
    console.log('router middleware - no token found')
    console.log(req.body)
    res.set({
      'WWW-Authenticate': 'Bearer realm="home"'
    })
    res.status(401).json({error:'Authentication required'})
    return
  }

  console.log('router middleware - token found, verifying')

  var root = jwt.decode(token).root

  var secret = root
    ? secrets.root.secret
    : secrets.user.secret

  jwt.verify(token, secret, function(err, d) {
    if (err) {
      res.set({
        'WWW-Authenticate': 'Bearer realm="home"'
        + ',error="invalid_token"'
      })
      res.status(401).json({error: 'Invalid token'})
      return
    }

    next()
  })
})

function getToken(req) {
  if (req.headers.authorization) {
    var c = req.headers.authorization.split(' ')
    if (c[0] == 'Bearer')
      return c[1]
  }
  return null
}


function defaultHandler(res) {
  return function(status, result, headers) {
    assert.equal(typeof status, 'number')
    assert.equal(typeof result, 'object')
    console.log('defaultHandler - headers: ' + headers)
    console.log('defaultHandler - status: ' + status)
    console.log('defaultHandler - result: ')
    console.log(result)
    //if (headers)
    //  res.set(headers)

    res.status(status).json(result)
  }
}

// Define application routes

app.post('/authenticate', function(req, res) {
  login.authenticate(req.body, defaultHandler(res))
});


//Users REST API

// Admin use only - create /users for POST
app.post('/adminCreate', function(req, res) {
  users.createUser(req.body, function (out) {
    res.json(out)
  })
})

// Create endpoint /users for POST
app.post('/users', function(req, res) {
  users.createUser(req.body, function (out) {
    res.json(out)
  })
})

// Create endpoint /users for GET
app.get('/users', function(req, res) {
  users.getUsers(function (out) {
    res.json(out)
  })
})

// Create endpoint /users/:user_id for PUT
app.put('/users/:userid', function(req, res) {
  users.putUser(req.params.userid, function (out) {
    res.json(out)
  })
})

// Create endpoint /users/:user_id for GET
app.get('/users/:userid', function(req, res) {
  users.getUser(req.params.userid, function (out) {
    res.json(out)
  })
})

// Create endpoint /users/:user_id for DELETE
app.delete('/users/:userid', function(req, res) {
  users.deleteUser(req.params.userid, function (out) {
    res.json(out)
  })
})

app.delete('/users', function(req, res) {
  users.deleteAll(function (out) {
    res.json(out)
  })
})


//Create Http Server to listen for requests to routes
var server = app.listen(4000, function () {
  console.log('Listening on port', server.address().port)
})

app.use('/', router);

module.exports = app;
