var mongoose = require("mongoose");

// SCHEMA SETUP
var placeSchema = new mongoose.Schema({
	name: String,
	image: String,
	imageId: String,
	cost: Number,
	description: String,
	createdAt: {type: Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("Place", placeSchema);