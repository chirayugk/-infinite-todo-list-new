const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  // You can add additional fields here if you want
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);