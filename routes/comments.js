const express     = require("express"),
      router      = express.Router({mergeParams: true}),
      Campground  = require("../models/campground"),
      Comment     = require("../models/comment");


//check if logged in before display dashboard
function isLoggedIn(req, res, next) {
   if(req.isAuthenticated()) {
      return next();
   }
   res.redirect("/login");
}

//COMMENTS new
//must be logged in (isLoggedIn) to comment
router.get("/new", isLoggedIn, (req, res) => {
   Campground.findById(req.params.id, (err, campground) => {
      if(err) {
         console.log(err);
      } else {
         res.render("comments/new", {campground: campground});
      }
   });
});

//COMMENTS create
router.post("/", isLoggedIn, (req, res) => {
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
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               res.redirect("/campgrounds/" + campground._id);
            }
         });
      }
   });
   //connect new comment to campground

});

//COMMENTS EDIT
router.get("/:comment_id/edit", (req, res) => {
   Comment.findById(req.params.comment_id, (err, foundComment) => {
      if(err) {
         console.log(err);
         res.redirect("back");
      } else {
         //req.params.id comes from /campgrounds/:id route
         res.render("comments/edit", 
         {campground_id: req.params.id, comment: foundComment });
      }
   });

});

//COMMENTS UPDATE
router.put("/:comment_id", (req, res) => {
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
      if(err) {
         res.redirect("back");
      } else {
         res.redirect("/campgrounds/" + req.params.id);
      }
   });
});

module.exports = router;