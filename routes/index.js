let express = require("express");
let router = express.Router(),
  passport = require("passport"),
  User = require("./../models/user");

//Authentication Routes
//Sign up form
router.get("/register", (req, res) => {
  res.render("register");
});

//Signup Logic
router.post("/register", (req, res) => {
  let newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function (err, createdUser) {
    if (err) {
      req.flash("error", "Cannot sign in :-" + err.message);
      return res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        req.flash(
          "success",
          "Welcome to the Hotel Hopper ," + req.body.username + " :)"
        );
        res.redirect("/hotels");
      });
    }
  });
});

//Login Form
router.get("/login", (req, res) => {
  res.render("login");
});

//Login Logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/hotels",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

//Logout Logic
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged out successfully! :)");
  res.redirect("/hotels");
});

//Middleware to check Login
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect("/login");
}

module.exports = router;
