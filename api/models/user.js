var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  firstname: String,
  lastname: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  created_at: Date,
  updated_at: Date
});


// on every save, add the date
userSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;