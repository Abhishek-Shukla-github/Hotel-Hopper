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
const user = require("./models/user");
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

//Navbar Fix
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

//Rest Routes
//Index Routes
app.get("/", (req, res) => {
  res.render("./hotels/landing");
});

//Hotel Routes
app.get("/hotels", (req, res) => {
  Hotel.find({}, function (err, hotels) {
    if (err) console.log(err);
    else {
      res.render("./hotels/index", { hotels: hotels });
    }
  });
});

//New Route
app.get("/new", isLoggedIn, (req, res) => {
  res.render("./hotels/new", { currentUser: req.user });
});

//Create Route
app.post("/hotels", isLoggedIn, (req, res) => {
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
app.get("/hotels/:id", (req, res) => {
  Hotel.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundHotel) {
      res.render("./hotels/show", { foundHotel: foundHotel });
    });
});

//Comment Routes
//Displaying form
app.get("/hotels/:id/comments/new", isLoggedIn, (req, res) => {
  Hotel.findById(req.params.id, function (err, foundHotel) {
    res.render("./comments/new", {
      foundHotel: foundHotel,
      currentUser: req.user,
    });
  });
});

//Creating the comment
app.post("/hotels/:id/comments", (req, res) => {
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

//Logout Logic
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/hotels");
});

app.listen(3000, () => {
  console.log("Server Running on port 3000!");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect("/login");
}
