const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
  // Passport-local-mongoose will add password, hash and salt fields
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);