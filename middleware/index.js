let Hotel = require("../models/hotel");
let Comment = require("../models/comment");
let middlewareObj = {};
middlewareObj.checkHotelOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Hotel.findById(req.params.id, function (err, foundHotel) {
      if (err) res.redirect("/hotels");
      else {
        if (foundHotel.author.id.equals(req.user._id)) {
          next();
        } else res.redirect("back");
      }
    });
  } else res.redirect("back");
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
  //Check if user is signed in
  if (req.isAuthenticated()) {
    //CHeck if user owns the comment
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) res.redirect("back");
      else {
        if (foundComment.author.id.equals(req.user.id)) {
          next();
        } else {
          req.flash(
            "error",
            "Cannot perform this operation , please try again :`( !"
          );
        }
      }
    });
  } else {
    console.log("Please login first");
  }
};

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash("error", "You must be Logged in to perform this operation");
  return res.redirect("/login");
};

module.exports = middlewareObj;
