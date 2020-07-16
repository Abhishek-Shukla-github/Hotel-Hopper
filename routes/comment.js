let express = require("express");
let router = express.Router();
let Hotel = require("./../models/hotel");
let Comment = require("./../models/comment");

//Comment Routes
//Displaying form
router.get("/hotels/:id/comments/new", isLoggedIn, (req, res) => {
  Hotel.findById(req.params.id, function (err, foundHotel) {
    res.render("./comments/new", {
      foundHotel: foundHotel,
      currentUser: req.user,
    });
  });
});

//Creating the comment
router.post("/hotels/:id/comments", (req, res) => {
  Hotel.findById(req.params.id, function (err, foundHotel) {
    if (err) console.log(err);
    else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) console.log(err);
        else {
          //Adding id and username to comment from the forr
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //saving the comment
          comment.save();
          //Pushing the comment to the comments array
          foundHotel.comments.push(comment);
          foundHotel.save();
          res.redirect("/hotels/" + foundHotel._id);
          // console.log(comment);
          // console.log(foundHotel);
        }
      });
    }
  });
});

//Middleware to check login
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect("/login");
}

module.exports = router;
