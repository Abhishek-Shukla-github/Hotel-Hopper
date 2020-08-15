let express = require("express");
let router = express.Router();
let Hotel = require("./../models/hotel");
let middleware = require("../middleware/index");
let multer = require("multer");
require("dotenv").config();

let storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
let imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
let upload = multer({ storage: storage, fileFilter: imageFilter });

let cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "prof-noob123",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
router.post(
  "/hotels",
  middleware.isLoggedIn,
  upload.single("image"),
  (req, res) => {
    cloudinary.v2.uploader.upload(req.file.path, async function (err, result) {
      // add cloudinary url for the image to the hotel object under image property
      if (err) {
        req.flash("err", "ERROR:- " + err);
        res.redirect("/hotels");
      }
      if (req.file) {
        try {
          req.body.hotel.imageId = await result.public_id;
          req.body.hotel.image = await result.secure_url;
          console.log("SECURE_URL:- " + result.public_id);
          console.log(req.body.hotel);
        } catch {
          req.flash("err", "ERROR:- " + err);
          res.redirect("/");
        }
      }
      // add author to hotel
      req.body.hotel.author = {
        id: req.user._id,
        username: req.user.username,
      };
      Hotel.create(req.body.hotel, function (err, newCamp) {
        if (err) console.log(err);
        else {
          req.flash("success", "Successfully created Hotel!");
          res.redirect("/");
        }
      });
    });
  }
);

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
router.put(
  "/hotels/:id",
  middleware.checkHotelOwnership,
  upload.single("image"),
  function (req, res) {
    Hotel.findById(req.params.id, async function (err, hotel) {
      if (err) {
        req.flash("error", "Not entered: " + err.message);
        res.redirect("back");
      } else {
        if (req.file) {
          try {
            await cloudinary.v2.uploader.destroy(hotel.imageId);
            let result = await cloudinary.v2.uploader.upload(req.file.path);
            console.log("Public_id:- " + hotel.imageId);
            hotel.imageId = await result.public_id;
            hotel.image = await result.secure_url;
          } catch (err) {
            req.flash("error", "Catch Block : " + err.message);
            return res.redirect("back");
          }
        }
        hotel.name = req.body.hotel.name;
        hotel.country = req.body.hotel.country;
        hotel.about = req.body.hotel.about;
        hotel.save();
        req.flash("success", "Successfully Updated!");
        res.redirect("/hotels/" + hotel._id);
      }
    });
  }
);

//Delete Route
router.delete("/hotels/:id", function (req, res) {
  Hotel.findById(req.params.id, async function (err, hotel) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
      await cloudinary.v2.uploader.destroy(hotel.imageId);
      hotel.remove();
      req.flash("success", "Hotel Deleted Successfully deleted successfully!");
      res.redirect("/hotels");
    } catch (err) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    }
  });
});

module.exports = router;
