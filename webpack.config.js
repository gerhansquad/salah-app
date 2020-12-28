const path = require("path");
module.exports = {
	mode: "development",
	devtool: false,
	entry: "./app.js",
	output: {
		filename: "index.js",
		path: path.resolve(__dirname, "www", "js"),
	},
};
