const Http = require("http"); // Module for building/creating HTTPS servers
const Express = require("express"); // Module for creating and working with an Express application
const BodyParser = require("body-parser");

const port = 3000;
const app = Express(); // Creating an Express application
const server = Http.createServer(app); // Building the Express server

server.listen(port, function () {
	console.log(`\nExpress server listening on port ${port}`);
});

app.use(BodyParser.urlencoded({ extended: true }));

app.post("/", function (req, res) {
	console.error(req.body.error);
	res.status(200);
});

server.on("error", (err) => {
	console.error(err);
});
