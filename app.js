
const express                 = require("express"),
      app                     = express(),
      bodyParser              = require("body-parser"),
      mongoose                = require("mongoose"),
      passport                = require("passport"),
      LocalStrategy           = require("passport-local"),
      
      Campground              = require("./models/campground"),
      seedDB                  = require("./seed"),
      Comment                 = require("./models/comment"),
      User                    = require("./models/user");


mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

//seedDB();


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

//check if logged in before display dashboard
function isLoggedIn(req, res, next) {
   if(req.isAuthenticated()) {
      return next();
   }
   res.redirect("/login");
}

//store user in locals
app.use( (req, res, next) => {
   res.locals.currentUser = req.user;
   next();
});
//============================================================

//ROUTES
app.get("/", (req, res)=> {
   res.render("landing");
});

app.get("/campgrounds", (req, res) => {

   Campground.find({}, (err, allCampgrounds) => {
      if(err){
         console.log(err);
      } else{
         res.render("campgrounds/index", 
         {campgrounds: allCampgrounds, currentUser: req.user});
      }
   });
   
});


app.post("/campgrounds", (req, res) => {
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.desc;
   var newCampground = { name: name, image: image, description: desc};
   
   Campground.create(newCampground, (err, newlyCreated) => {
      if(err){
         console.log(err);
      } else {
         res.redirect("campgrounds");
      }
   }); 
});

app.get("/campgrounds/new", (req, res) => {
   res.render("campgrounds/new");
});

app.get("/campgrounds/:id", (req, res) => {
   Campground.findById(req.params.id).populate("comments").exec( (err, foundCampground) => {
      if(err){
         console.log(err);
      } else{
         res.render("campgrounds/show", {campground: foundCampground});
      }
   });
   
   
});

//COMMENTS ROUTES
//must be logged in (isLoggedIn) to comment
app.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
   Campground.findById(req.params.id, (err, campground) => {
      if(err) {
         console.log(err);
      } else {
         res.render("comments/new", {campground: campground});
      }
   });
});


app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
   //lookup campground by id
   Campground.findById(req.params.id, (err, campground) => {
      if(err) {
         console.log(err);
         res.redirect("/campgrounds");
      } else {    //create new comment
         Comment.create(req.body.comment, (err, comment) => {
            if(err) {
               console.log(err);
            } else {
               campground.comments.push(comment);
               campground.save();
               res.redirect("/campgrounds/" + campground._id);
            }
         });
      }
   });
   //connect new comment to campground

});

//AUTH ROUTES

//show register form
app.get("/register", (req, res) =>{
   res.render("register");
});

app.post("/register", (req, res) => {
   var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, (err, user) => {
      if(err) {
         console.log(err);
         return res.render("register");
      } 
      passport.authenticate("local")(req, res, () => {
         res.redirect("/campgrounds");
      });
   });
});

//LOGIN ROUTES
app.get("/login", (req, res) => {
   res.render("login");
});

app.post("/login", passport.authenticate("local", 
   {
      successRedirect : "/campgrounds",
      failureRedirect : "/login"
   }),
   (req, res) => {

   }
);

//LOGOUT
app.get("/logout", (req, res) => {
   req.logout();
   res.redirect("/");
});

app.listen(3000, () =>{
   console.log("working");
});

