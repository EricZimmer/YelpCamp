
var   express     = require("express"),
      app         = express(),
      bodyParser  = require("body-parser"),
      mongoose    = require("mongoose"),
      Campground  = require("./models/campground"),
      seedDB      = require("./seed"),
      Comment     = require("./models/comment");


mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

seedDB();


app.get("/", (req, res)=> {
   res.render("landing");
});

app.get("/campgrounds", (req, res) => {

   Campground.find({}, (err, allCampgrounds) => {
      if(err){
         console.log(err);
      } else{
         res.render("campgrounds/index", {campgrounds: allCampgrounds});
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
app.get("/campgrounds/:id/comments/new", (req, res) => {
   Campground.findById(req.params.id, (err, campground) => {
      if(err) {
         console.log(err);
      } else {
         res.render("comments/new", {campground: campground});
      }
   });
   res.render("comments/new");
});


app.post("/campgrounds/:id/comments", (req, res) => {
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


app.listen(3000, () =>{
   console.log("working");
});

