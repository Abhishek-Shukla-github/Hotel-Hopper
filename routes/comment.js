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

//Edit Logic
//Displaying the edit form
router.get(
  "/hotels/:id/comments/:comment_id/edit",
  middleware.checkCommentOwnership,
  (req, res) => {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err) res.redirect("back");
      else {
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
        if (err) res.redirect("back");
        else {
          res.redirect("/hotels/" + req.params.id);
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
      if (err) res.redirect("/hotels/" + req.params.id);
      else res.redirect("/hotels/" + req.params.id);
    });
  }
);

module.exports = router;
