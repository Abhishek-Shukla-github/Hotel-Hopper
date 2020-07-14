let mongoose = require("mongoose");
let Comment = require("./../models/comment");
let Hotel = require("./../models/hotel");
let passportLocalMongoose = require("passport-local-mongoose");
let userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
