let express = require("express");
app = express();
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/hotelHopper", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let hotelSchema = new mongoose.Schema({
  name: String,
  location: String,
  country: String,
  about: String,
  image: String,
});

let Hotel = mongoose.model("Hotel", hotelSchema);
app.use(express.static(__dirname + "/public"));
// Hotel.create({
//   name: "Aleppo",
//   location: "Lund",
//   country: "Sweden",
//   image:
//     "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Sheraton_Aleppo_Alp.JPG/360px-Sheraton_Aleppo_Alp.JPG",
//   about:
//     "The Sheraton Aleppo Hotel is a former five-star hotel opened in 2007 in the ancient part of Aleppo city, within the historic walls, on Al-Khandaq street, Aqabeh district, near the Bab al-Faraj clock tower.",
// });

//Rest Routes
//Index Routes
app.get("/hotels", (req, res) => {
  Hotel.find({}, function (err, hotels) {
    if (err) console.log(err);
    else {
      res.render("index", { hotels: hotels });
    }
  });
});
app.get("/", (req, res) => {
  res.render("landing");
});

//New Route
app.get("/new", (req, res) => {
  res.render("new");
});

//Create Route
app.post("/hotels", (req, res) => {
  Hotel.create(req.body.hotel, function (err, createdHotel) {
    if (err) res.render("new");
    else res.redirect("/hotels");
  });
});

//Show route
app.get("/hotels/:id", (req, res) => {
  Hotel.findById(req.params.id, function (err, hotel) {
    res.render("show", { hotel: hotel });
  });
});
app.listen(3000, () => {
  console.log("Server Running on port 3000!");
});
