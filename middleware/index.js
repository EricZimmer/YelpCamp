const Campground     = require("../models/campground"),
      Comment        = require("../models/comment");

//ALL OF THE MIDDLEWARE=====================

const middlewareObj = {

   //check if logged in before display dashboard
   isLoggedIn : (req, res, next) => {
      if(req.isAuthenticated()) {
         return next();
      }
      req.flash("error", "You need to be logged in to do that!");
      res.redirect("/login");
   },

   checkCampgroundOwnership : (req, res, next) => {
      if(req.isAuthenticated()) {
         Campground.findById(req.params.id, (err, foundCampground) => {
            if(err || !foundCampground) {
               req.flash("error", "Campground not found");
               console.log(err);
               res.redirect("/campgrounds");
            } else {
               if(foundCampground.author.id.equals(req.user._id)) { // if campground author === logged in user
                  next();
               } else {
                  req.flash("error", "You don't have permission to do that!");
                  res.redirect("back");
               }           
            }
         });
      } else {
         req.flash("error", "You need to be logged in to do that!");
         res.redirect("back");
      }
   },

   checkCommentOwnership : (req, res, next) => {
      if(req.isAuthenticated()) {
         Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err || !foundComment) {
               console.log(err);
               req.flash("error", "Comment not found");
               res.redirect("back");
            } else {
               if(foundComment.author.id.equals(req.user._id)) { // if campground author === logged in user
                  next();
               } else {
                  req.flash("error", "You don't have permission to do that");
                  res.redirect("back");
               }           
            }
         });
      } else { //not logged in
         req.flash("error", "Please login or register to comment!");
         res.redirect("back");
      }
   }
};



module.exports = middlewareObj;

