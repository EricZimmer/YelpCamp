const Campground     = require("../models/campground"),
      Comment        = require("../models/comment");

//ALL OF THE MIDDLEWARE=====================

const middlewareObj = {

   //check if logged in before display dashboard
   isLoggedIn : (req, res, next) => {
      if(req.isAuthenticated()) {
         return next();
      }
      res.redirect("/login");
   },

   checkCampgroundOwnership : (req, res, next) => {
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
   },

   checkCommentOwnership : (req, res, next) => {
      if(req.isAuthenticated()) {
         Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err) {
               console.log(err);
               res.redirect("back");
            } else {
               if(foundComment.author.id.equals(req.user._id)) { // if campground author === logged in user
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
};



module.exports = middlewareObj;

