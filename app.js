
var   express     = require("express"),
      app         = express(),
      bodyParser  = require("body-parser"),
      mongoose    = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//SCEMA
var campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);


app.get("/", (req, res)=> {
  res.render("landing");
});

app.get("/campgrounds", (req, res) => {

  Campground.find({}, (err, allCampgrounds) => {
    if(err){
      console.log(err);
    } else{
      res.render("index", {campgrounds: allCampgrounds});
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
  res.render("new.ejs");
});

app.get("/campgrounds/:id", (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if(err){
      console.log(err);
    } else{
      res.render("show", {campground: foundCampground});
    }
  });
  
  
});




app.listen(3000, () =>{
  console.log("working");
});

