let Hotel = require("./hotel");
let mongoose = require("mongoose");
const { model } = require("./hotel");
let commentSchema = new mongoose.Schema({
  text: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
