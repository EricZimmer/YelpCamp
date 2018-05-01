const express     = require("express"),
      router      = express.Router({mergeparams : true}),
      Campground  = require("../models/campground");

//check if logged in before display dashboard
function isLoggedIn(req, res, next) {
   if(req.isAuthenticated()) {
      return next();
   }
   res.redirect("/login");
}

//Show all campgrounds
router.get("/", (req, res) => {

   Campground.find({}, (err, allCampgrounds) => {
      if(err){
         console.log(err);
      } else{
         res.render("campgrounds/index", 
         {campgrounds: allCampgrounds, currentUser: req.user});
      }
   });
   
});

//new campground creation page
router.get("/new", isLoggedIn, (req, res) => {
   res.render("campgrounds/new");
});

//create campground and redirect to campgrounds page
router.post("/", isLoggedIn, (req, res) => {
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.desc;
   var authorName = req.user.username;
   var newCampground = { name: name, image: image, description: desc, author : {username: authorName} };
   
   Campground.create(newCampground, (err, newCamp) => {
      if(err){
         console.log(err);
      } else {
         res.redirect("campgrounds/" + newCamp._id);
      }
   }); 
});

//show individual campground page
router.get("/:id", (req, res) => {
   Campground.findById(req.params.id).populate("comments").exec( (err, foundCampground) => {
      if(err){
         console.log(err);
      } else{
         res.render("campgrounds/show", {campground: foundCampground});
      }
   });  
});

module.exports = router;