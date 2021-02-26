var express = require("express");
var router = express.Router();
var Place = require("../models/place");
var middleware = require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'ddxlaovmy',
  api_key: '258198969648693',
  api_secret: '7Yk2ILnqY7uOpgMZ9gkZfdLglAI'
});


// INDEX - show all places
router.get("/", function(req, res){
	var noMatch = null;
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get all places from DB
		Place.find({name: regex}, function(err, allPlaces){
		if(err){
			console.log(err);
		} else {
			if (allPlaces.length < 1) {
				noMatch = "No places match that keyword.";
			}
			res.render("places/index",{places: allPlaces, noMatch: noMatch, page: "places"});
		}
	});
	} else {
		// Get all places from DB
		Place.find({}, function(err, allPlaces){
		if(err){
			console.log(err);
		} else {
			res.render("places/index",{places: allPlaces, noMatch: noMatch, page: "places"});
		}
	});
	}
});

// CREATE - add new places to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
	cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
	  // add cloudinary url for the image to the place object under image property
	  req.body.place.image = result.secure_url;
	// add image's public_id to 'place' object
      req.body.place.imageId = result.public_id;
	  // add author to place
	  req.body.place.author = {
		id: req.user._id,
		username: req.user.username
	  }
	  Place.create(req.body.place, function(err, place) {
		if (err) {
		  req.flash('error', err.message);
		  return res.redirect('back');
		}
		res.redirect('/places/' + place.id);
	  });
	});
});

// NEW - show form to create new places
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("places/new");
});

// SHOW - shows more info about one place
router.get("/:id", function(req, res){
	//find the place with provided ID
	Place.findById(req.params.id).populate("comments").exec(function(err, foundPlace){
		if(err || !foundPlace){
			req.flash("error", "Place not found");
			res.redirect("back");
		} else {
			console.log(foundPlace);
			//render show template with that place
			res.render("places/show", {place: foundPlace});
		}
	});
});

// EDIT PLACE ROUTE
router.get("/:id/edit", middleware.checkPlaceOwnership, function(req, res){
	Place.findById(req.params.id, function(err, foundPlace){
		res.render("places/edit", {place: foundPlace});	
	}); 
});

// UPDATE PLACE ROUTE
router.put("/:id", upload.single('image'), middleware.checkPlaceOwnership, function(req, res){
    Place.findById(req.params.id, async function(err, place){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(place.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  place.imageId = result.public_id;
                  place.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            place.name = req.body.name;
            place.description = req.body.description;
            place.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/places/" + place._id);
        }
    });
});

// DESTROY PLACE ROUTE
router.delete('/:id', middleware.checkPlaceOwnership, function(req, res) {
  Place.findById(req.params.id, async function(err, place) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(place.imageId);
        place.remove();
        req.flash('success', 'Place deleted successfully!');
        res.redirect('/places');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;