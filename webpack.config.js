const path = require("path");
module.exports = {
	entry: "./www/js/index.js",
	output: {
		filename: "build.js",
		path: path.resolve(__dirname, "www", "js", "dist"),
	},
};
