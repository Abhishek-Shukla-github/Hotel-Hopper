let express = require("express");
let router = express.Router();
let Hotel = require("./../models/hotel");

//Rest Routes
// Hotel Routes
router.get("/hotels", (req, res) => {
  Hotel.find({}, function (err, hotels) {
    if (err) console.log(err);
    else {
      res.render("./hotels/index", { hotels: hotels });
    }
  });
});

//New Route
router.get("/hotels/new", isLoggedIn, (req, res) => {
  res.render("./hotels/new", { currentUser: req.user });
});

//Create Route
router.post("/hotels", isLoggedIn, (req, res) => {
  let name = req.body.name;
  let location = req.body.location;
  let country = req.body.country;
  let about = req.body.about;
  let image = req.body.image;
  let author = {
    id: req.user.id,
    username: req.user.username,
  };
  let hotel = {
    name: name,
    location: location,
    country: country,
    about: about,
    image: image,
    author: author,
  };
  Hotel.create(hotel, function (err, createdHotel) {
    if (err) res.render("./hotels/new");
    else {
      createdHotel.save();
      res.redirect("/hotels");
    }
  });
});

//Show route
router.get("/hotels/:id", (req, res) => {
  Hotel.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundHotel) {
      res.render("./hotels/show", { foundHotel: foundHotel });
    });
});

//Editing the Hotels
//Displaying the Edit form
router.get("/hotels/:id/edit", (req, res) => {
  Hotel.findById(req.params.id, function (err, foundHotel) {
    if (err) res.redirect("/hotels");
    else {
      res.render("hotels/edit", { foundHotel: foundHotel });
    }
  });
});

//Saving the changes of edit operation
router.put("/hotels/:id", (req, res) => {
  Hotel.findByIdAndUpdate(req.params.id, req.body.hotel, function (
    err,
    updatedHotel
  ) {
    if (err) {
      console.log("Error");
      res.redirect("/hotels/" + req.params.id);
    } else res.redirect("/hotels/" + req.params.id);
  });
});

//Delete Route
router.delete("/hotels/:id", (req, res) => {
  Hotel.findByIdAndDelete(req.params.id, function (err, deletedHotel) {
    if (err) res.redirect("/hotels");
    else res.redirect("/hotels");
  });
});

//Middleware to check Login
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect("/login");
}

module.exports = router;
