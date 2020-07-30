let express = require("express");
let router = express.Router();
let Hotel = require("./../models/hotel");
let middleware = require("../middleware/index");

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
router.get("/hotels/new", middleware.isLoggedIn, (req, res) => {
  res.render("./hotels/new", { currentUser: req.user });
});

//Create Route
router.post("/hotels", middleware.isLoggedIn, (req, res) => {
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
      req.flash(
        "success",
        "Hotel added successfully, thank you for sharing your experience! :)"
      );
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
router.get("/hotels/:id/edit", middleware.checkHotelOwnership, (req, res) => {
  //Check if user if logged in
  Hotel.findById(req.params.id, function (err, foundHotel) {
    res.render("hotels/edit", { foundHotel: foundHotel });
  });
});

//Saving the changes of edit operation
router.put("/hotels/:id", middleware.checkHotelOwnership, (req, res) => {
  Hotel.findByIdAndUpdate(req.params.id, req.body.hotel, function (
    err,
    updatedHotel
  ) {
    if (err) {
      req.flash("error", "Error:- " + err + ". Please try again :(");
      res.redirect("/hotels/" + req.params.id);
    } else {
      req.flash("success", "Changes to the Hotel saved successfully! :)");
      res.redirect("/hotels/" + req.params.id);
    }
  });
});

//Delete Route
router.delete("/hotels/:id", middleware.checkHotelOwnership, (req, res) => {
  Hotel.findByIdAndDelete(req.params.id, function (err, deletedHotel) {
    if (err) {
      req.flash("error", "There was an error , please try again :(");
      res.redirect("/hotels");
    } else {
      req.flash("success", "Hotel deleted successfully :)");
      res.redirect("/hotels");
    }
  });
});

module.exports = router;
