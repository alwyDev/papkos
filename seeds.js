var mongoose = require("mongoose");
var Place = require("./models/place");
var Comment = require("./models/comment");

var seeds = [
	{
		name: "Kocheng",
		image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/250px-Cat03.jpg",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lacus vel facilisis volutpat est velit egestas dui id ornare. Non enim praesent elementum facilisis leo vel fringilla est ullamcorper."
	},
	{
		name: "Ko",
		image: "https://www.rspcasa.org.au/wp-content/uploads/2017/09/Cat-Banner-Mobile-600x300-fit-crop-constrain-q70-mobile_banner_image.png",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lacus vel facilisis volutpat est velit egestas dui id ornare. Non enim praesent elementum facilisis leo vel fringilla est ullamcorper."
	},
	{
		name: "Cheng",
		image: "https://www.kitska.com.au/wp-content/uploads/2018/09/Hairless-kitty-600x300.jpg",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lacus vel facilisis volutpat est velit egestas dui id ornare. Non enim praesent elementum facilisis leo vel fringilla est ullamcorper."
	}
];

async function seedDB(){
	try {
		await Place.remove({});
		console.log('place removed');
		await Comment.remove({});
		console.log('comment removed');

		for(const seed of seeds) {
			let place = await Place.create(seed);
			console.log('place created');
			let comment = Comment.create(
				{
					text: "This place is cool!",
					author: "Alwy"
				}
			)
			console.log('comment created');
			place.comments.push(comment);
			place.save();
			console.log('comment added to place');
		}
	} catch(err) {
		console.log(err);
	}
}

module.exports = seedDB;
