const express     = require("express"),
      router      = express.Router({mergeparams : true}),
      Campground  = require("../models/campground");

//MIDDLEWARE============================

//check if logged in before display dashboard
function isLoggedIn(req, res, next) {
   if(req.isAuthenticated()) {
      return next();
   }
   res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next) {
   if(req.isAuthenticated()) {
      Campground.findById(req.params.id, (err, foundCampground) => {
         if(err) {
            console.log(err);
            res.redirect("back");
         } else {
            if(foundCampground.author.id.equals(req.user._id)) { // if campground author === logged in user
               next();
            } else {
               res.redirect("back");
            }           
         }
      });
   } else {
      res.redirect("back");
   }
}

//============================MIDDLEWARE

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
   var authorName = req.user; //not DRY to demonstrate object insertion in below line
   var newCampground = { name: name, image: image, description: desc, author : {id: authorName._id, username: authorName.username} };
   
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

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", checkCampgroundOwnership,(req, res) => {
   //check if user is logged in to edit   
   Campground.findById(req.params.id, (err, foundCampground) => {
      res.render("campgrounds/edit", {campground: foundCampground});
   });            
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", (req, res) => {
   //check if user is logged in to edit
   if(req.isAuthenticated()) {

   } else {
      console.log("you need")
   }
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updateCampground) => {
      if(err) {
         console.log(err);
         //res.redirect("campgrounds");
      } else {
         res.redirect("/campgrounds/" + req.params.id);
      }
   });
});

router.delete("/:id", (req, res) => {
   Campground.findByIdAndRemove(req.params.id, err => {
      if(err) {
         console.log(err);
         res.redirect("/campgrounds");
         
      } else {
         res.redirect("/campgrounds");
      }
   });
});

module.exports = router;