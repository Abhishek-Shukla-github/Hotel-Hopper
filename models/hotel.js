let mongoose = require("mongoose");

let hotelSchema = new mongoose.Schema({
  name: String,
  location: String,
  country: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  about: String,
  image: String,
});

module.exports = mongoose.model("Hotel", hotelSchema);
