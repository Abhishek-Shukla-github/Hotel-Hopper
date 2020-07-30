let express = require("express");
let bodyParser = require("body-parser");
let mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  methodOverride = require("method-override"),
  flash = require("connect-flash");

let Hotel = require("./models/hotel"),
  Comment = require("./models/comment"),
  User = require("./models/user");

app = express();
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/hotelHopper", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let hotelRoutes = require("./routes/hotel"),
  commentRoutes = require("./routes/comment"),
  authRoutes = require("./routes/index");

app.use(express.static(__dirname + "/public"));
app.use(flash());
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
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//Index Routes
app.get("/", (req, res) => {
  res.render("./hotels/landing");
});

app.listen(3000, () => {
  console.log("Server Running on port 3000!");
});

//Using the routes
app.use(hotelRoutes);
app.use(commentRoutes);
app.use(authRoutes);
