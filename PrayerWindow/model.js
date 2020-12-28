let system_month;
let timezone;
let geodata = {};

export function initPrayerModel() {
	// console.log = function () {};
	system_month = new Date().getMonth() + 1;
	timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	navigator.geolocation.getCurrentPosition(onSuccess, onError);

	// onSuccess Callback
	// This method accepts a Position object, which contains the
	// current GPS coordinates
	function onSuccess(position) {
		// Get postion data and store in geodata
		geodata.latitude = position.coords.latitude;
		geodata.longitude = position.coords.longitude;
	}
	// onError Callback receives a PositionError object
	function onError(error) {
		console.log(error.message);
	}

	// checkIfSalahFileExists
	checkIfSalahFileExists();

	// Done with all checks, proceed to display part
}

function checkIfSalahFileExists() {
	window.requestFileSystem(
		LocalFileSystem.PERSISTENT,
		0,
		function (fileSystem) {
			fileSystem.root.getFile("salah-times.json", { create: false }, fileExists, fileDoesNotExist);
		},
		getFSFail
	);

	function fileExists(fileEntry) {
		// console.log("File " + fileEntry.fullPath + " exists!");
		readFile("saved-month.json");
	}
	function fileDoesNotExist() {
		console.log("salah file doesn't exist, make api call, calling reqAPI()");
		reqAPI(); //If salah file doesn't exist, make API req
	}
	function getFSFail(evt) {
		console.log(evt.target.error.code);
	}
}

// This function checks for the change in timezone or month and calls reqAPI()
function readFile(fname) {
	window.requestFileSystem(
		LocalFileSystem.PERSISTENT,
		0,
		function (fs) {
			fs.root.getFile(fname, { create: false, exclusive: false }, function (fileEntry) {
				fileEntry.file(
					function (file) {
						var reader = new FileReader();
						reader.onloadend = function () {
							console.log("Successful file read: " + this.result);
							let data = JSON.parse(this.result);
							if (fname.localeCompare("saved-month.json") == 0) {
								console.log("Reading saved-month.json");
								if (system_month != data.month) {
									reqAPI(); // if this is called, then the timezone will be automatically updated
								}
							} else {
								console.log("Reading salah-times.json");
								if (timezone != data.data[0].meta.timezone) {
									reqAPI(); // if this is called, then the month will be automatically updated
								}
							}
						};
						reader.readAsText(file);
					},
					function (error) {
						throw error;
					}
				);
			});
		},
		function (error) {
			throw error;
		}
	);
}

function reqAPI() {
	const AdhanAPIParams = {
		// latitude: `${geodata.latitude}`,
		// longitude: `${geodata.longitude}`,
		latitude: "25.2048", // dubai geodata
		longitude: "55.2708", // dubai geodata
		method: "2",
	};
	// this is a new month OR no prayer info saved prior
	cordova.plugin.http.get(
		"https://api.aladhan.com/v1/calendar",
		AdhanAPIParams,
		{ Authorization: "OAuth2: token" },
		function (response) {
			createwriteFile(response.data, "salah-times.json");
			createwriteFile(system_month, "saved-month.json");
		},
		function (response) {
			throw `API CALL ERROR: ${response.error}`;
		}
	);
}

function createwriteFile(data, fname) {
	window.requestFileSystem(
		LocalFileSystem.PERSISTENT,
		100000,
		function (fs) {
			fs.root.getFile(fname, { create: true, exclusive: false }, function (fileEntry) {
				fileEntry.createWriter(function (fileWriter) {
					fileWriter.onwriteend = function () {
						console.log("Successful file write...");
					};

					fileWriter.onerror = function (e) {
						throw "Failed file write: " + e.toString();
					};

					if (fname.localeCompare("saved-month.json") == 0) {
						console.log("Writing file saved-month");
						fileWriter.write({ month: data });
					} else {
						console.log("Writing file salah-times");
						fileWriter.write(data);
					}
				});
			});
		},
		function (error) {
			throw error;
		}
	);
}
