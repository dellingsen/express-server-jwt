var should = require('chai').should()
  , expect = require('chai').expect
  , assert = require('chai').assert
  , Joi = require('Joi')
  , async = require('async')
  , server = require('../app');

var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
  
describe('Authenticate', function() {

  // Can just use this to test existing user
  it('Authenticate existing user for login', function(done) {
 		  chai.request(server)
          .post('/authenticate')
	      .send({
              username: 'test1',
              password: 'password'
            })
		  .end(function(err, res){
				 res.should.have.status(200);
				 console.log("Response auth_state:");
				 console.log(res.body.auth_state);
				 console.log("Response token:");
				 console.log(res.body.token);
				 done();
		   });
    })
	
  // Otherwise use this flow to create a test user, authenticate, and delete
  it('Admin create/authenticate/delete user endpoint', function(done) {
	  
	  var userToken;
	  var userId;
	  
      async.waterfall([
	  
        // Admin Create user
		
        function(next) {
		  chai.request(server)
          .post('/adminCreate')
	      .send({
              username: 'testauth',
              firstname: 'temp',
              lastname: 'user',
              email: 'tempuser@mail.com',
              password: 'password'
            })
		  .end(function(err, res){
				 res.should.have.status(200);
				 userId = res.body._id;
				 next(err, res) 
		   });
        },
				
        // authenticate user
        function(r, next) {
 		  chai.request(server)
          .post('/authenticate')
	      .send({
              username: r.body.username,
              password: "password" //plain text from above
            })
		  .end(function(err, res){
				 res.should.have.status(200);
				 console.log("Response token:");
				 console.log(res.body.token);
				 userToken = res.body.token;
				 next(err, res) 
		   });
        },

        // Delete the user
        function(r, next) {
		  chai.request(server)
          .delete('/users/' + userId)
          .set('Authorization', 'Bearer ' + userToken)
		  .end(function(err, res){
			   res.should.have.status(200);
			   next(err, r) 
		   });
        },

        // Verify that the user doesn't exist
        function(res, next) {
		  chai.request(server)		  
          .get('/users/'+res.body._id)
          .set('Authorization', 'Bearer ' + userToken)
		  .end(function(err, res){
			   next(err, res);
		   });
        }

      ], function(err, r) {
        if (err) throw err
        done()
      })
    })	
})
