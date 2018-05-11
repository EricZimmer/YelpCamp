const express  = require("express"),
      router   = express.Router(),
      passport = require("passport"),
      User     = require("../models/user");


//landing page
router.get("/", (req, res)=> {
   res.render("landing");
});


//AUTH ROUTES
//show register form
router.get("/register", (req, res) =>{
   res.render("register");
});

//create user
router.post("/register", (req, res) => {
   var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, (err, user) => {
      if(err) {
         console.log(err);
         req.flash("error", err.message);
         return res.redirect("register");
      } 
      passport.authenticate("local")(req, res, () => {
         req.flash("success", "Welcome to YelpCamp " + user.username + "!");
         res.redirect("/campgrounds");
      });
   });
});

//LOGIN ROUTES
router.get("/login", (req, res) => {
   res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local", 
   {
      successRedirect : "/campgrounds",
      failureRedirect : "/login"
   }),
   (req, res) => {

   }
);

//LOGOUT
router.get("/logout", (req, res) => {
   req.logout();
   req.flash("success", "Signed out of YelpCamp");
   res.redirect("/");
});

module.exports = router;