const express     = require("express"),
      router      = express.Router({mergeparams : true}),
      Campground  = require("../models/campground");
      middleware  = require("../middleware");


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
router.get("/new", middleware.isLoggedIn, (req, res) => {
   res.render("campgrounds/new");
});

//create campground and redirect to campgrounds page
router.post("/", middleware.isLoggedIn, (req, res) => {
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
      if(err || !foundCampground){
         console.log(err);
         req.flash("error", "Campground not found");
         res.redirect("/campgrounds");
      } else{
         res.render("campgrounds/show", {campground: foundCampground});
      }
   });  
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership,(req, res) => {
   //check if user is logged in to edit   
   Campground.findById(req.params.id, (err, foundCampground) => {
      res.render("campgrounds/edit", {campground: foundCampground});
   });            
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
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

router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
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