let mongoose = require("mongoose");

let hotelSchema = new mongoose.Schema({
  name: String,
  location: String,
  country: String,
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  about: String,
  image: String,
  imageId: String,
});

module.exports = mongoose.model("Hotel", hotelSchema);
