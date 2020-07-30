let express = require("express");
let router = express.Router();
let Hotel = require("./../models/hotel");
let Comment = require("./../models/comment");
let middleware = require("../middleware/index");

//Comment Routes
//Displaying form
router.get("/hotels/:id/comments/new", middleware.isLoggedIn, (req, res) => {
  Hotel.findById(req.params.id, function (err, foundHotel) {
    res.render("./comments/new", {
      foundHotel: foundHotel,
      currentUser: req.user,
    });
  });
});

//Creating the comment
router.post("/hotels/:id/comments", middleware.isLoggedIn, (req, res) => {
  Hotel.findById(req.params.id, function (err, foundHotel) {
    if (err) {
      req.flash("error", "There was an error , please try again");
      res.redirect("back");
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          req.flash("error", "Cannot save changes , please try again");
        } else {
          //Adding id and username to comment from the forr
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //saving the comment
          comment.save();
          //Pushing the comment to the comments array
          foundHotel.comments.push(comment);
          foundHotel.save();
          req.flash("success", "Comment added! :)");
          res.redirect("/hotels/" + foundHotel._id);
        }
      });
    }
  });
});

//Edit Logic
//Displaying the edit form
router.get(
  "/hotels/:id/comments/:comment_id/edit",
  middleware.checkCommentOwnership,
  (req, res) => {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err) {
        req.flash("error", "You don't have right to perform this operation");
      } else {
        res.render("comments/edit", {
          foundComment: foundComment,
          hotel_id: req.params.id,
        });
      }
    });
  }
);

//Saving the changes
router.put(
  "/hotels/:id/comments/:comment_id",
  middleware.checkCommentOwnership,
  (req, res) => {
    Comment.findByIdAndUpdate(
      req.params.comment_id,
      req.body.comment,
      function (err, updatedComment) {
        if (err) {
          req.flash("error", "There was an error, please try again");
          res.redirect("back");
        } else {
          req.flash("success", "Changes to the comment saved! :)");
          req.res.redirect("/hotels/" + req.params.id);
        }
      }
    );
  }
);

//Deleting the routes
router.delete(
  "/hotels/:id/comments/:comment_id",
  middleware.checkCommentOwnership,
  (req, res) => {
    Comment.findByIdAndDelete(req.params.comment_id, function (
      err,
      deletedComment
    ) {
      if (err) {
        req.flash(
          "error",
          "You don't have the right to perform this operation :("
        );
        res.redirect("/hotels/" + req.params.id);
      } else {
        req.flash("success", "Comment deleted successfully! :)");
        res.redirect("/hotels/" + req.params.id);
      }
    });
  }
);

module.exports = router;
