let express = require("express");
let bodyParser = require("body-parser");
let mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  methodOverride = require("method-override"),
  flash = require("connect-flash");
require("dotenv").config();

let Hotel = require("./models/hotel"),
  Comment = require("./models/comment"),
  User = require("./models/user");

app = express();
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
//Mongoose Setup
console.log("database: " + process.env.DATABASEURL);
const mongooseConnectString = process.env.DATABASEURL;
mongoose
  .connect(mongooseConnectString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to DB " + process.env.DATABASEURL);
  })
  .catch((err) => {
    console.log("ERROR: " + err.message);
  });

let hotelRoutes = require("./routes/hotel"),
  commentRoutes = require("./routes/comment"),
  authRoutes = require("./routes/index");

app.use(express.static(__dirname + "/public"));
app.use(flash());
app.locals.moment = require("moment");
//Passport Setup
app.use(
  require("express-session")({
    secret: process.env.SECRET,
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
