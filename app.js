let express = require("express");
app = express();
let bodyParser = require("body-parser");
let mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/hotelHopper", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let Hotel = require("./models/hotel");
let Comment = require("./models/comment");
let User = require("./models/user");
app.use(express.static(__dirname + "/public"));

//Passport Setup
app.use(
  require("express-session")({
    secret: "Hotel Hopper",
    resave: "false",
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Rest Routes
//Index Routes
app.get("/hotels", (req, res) => {
  Hotel.find({}, function (err, hotels) {
    if (err) console.log(err);
    else {
      res.render("./hotels/index", { hotels: hotels });
    }
  });
});
app.get("/", (req, res) => {
  res.render("./hotels/landing");
});

//New Route
app.get("/new", (req, res) => {
  res.render("./hotels/new");
});

//Create Route
app.post("/hotels", (req, res) => {
  Hotel.create(req.body.hotel, function (err, createdHotel) {
    if (err) res.render("./hotels/new");
    else res.redirect("/hotels");
  });
});

//Show route
app.get("/hotels/:id", (req, res) => {
  Hotel.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundHotel) {
      res.render("./hotels/show", { foundHotel: foundHotel });
    });
});

//Comment Route
app.get("/hotels/:id/comments/new", (req, res) => {
  Hotel.findById(req.params.id, function (err, foundHotel) {
    res.render("./comments/new", { foundHotel: foundHotel });
  });
});

app.post("/hotels/:id/comments", (req, res) => {
  Hotel.findById(req.params.id, function (err, foundHotel) {
    if (err) console.log(err);
    else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) console.log(err);
        else {
          comment.save();
          foundHotel.comments.push(comment);
          foundHotel.save();
          res.redirect("/hotels/" + foundHotel._id);
          console.log(comment);
          console.log(foundHotel);
        }
      });
    }
  });
});

//Authentication Routes

//Sign up form
app.get("/register", (req, res) => {
  res.render("register");
});

//Signup Logic
app.post("/register", (req, res) => {
  let newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function (err, createdUser) {
    if (err) {
      console.log(err);
      return res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        console.log("Hi" + createdUser);
        res.redirect("/hotels");
      });
    }
  });
});

//Login Form
app.get("/login", (req, res) => {
  res.render("login");
});

//Login Logic
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/hotels",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

app.listen(3000, () => {
  console.log("Server Running on port 3000!");
});
