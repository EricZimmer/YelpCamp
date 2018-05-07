const express                 = require("express"),
      app                     = express(),
      bodyParser              = require("body-parser"),
      mongoose                = require("mongoose"),
      passport                = require("passport"),
      LocalStrategy           = require("passport-local"),
      methodOverride          = require("method-override"),

      seedDB                  = require("./seed"),
      User                    = require("./models/user");

const commentRoutes           = require("./routes/comments"),
      campgroundRoutes        = require("./routes/campgrounds"),
      indexRoutes             = require("./routes/index");

app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//seedDB();  //delete then seed database with campgrounds/comments


//PASSPORT CONFIG
app.use(require("express-session")({
   secret: "Sabres are very very very bad but not forever!",
   resave: false,
   saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//MIDDLEWARE==================================================

// caching disabled for every route so you cannot go back after logout
app.use(function(req, res, next) {
   res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
   next();
});

//store user in locals
app.use( (req, res, next) => {
   res.locals.currentUser = req.user;
   next();
});
//============================================================

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, () =>{
   console.log("working");
});

