import { genericErrorHandler } from "../utils/utility";

let system_month
let timezone
let geodata = {}

export function initPrayerModel() {

	system_month = new Date().getMonth() + 1
	timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	navigator.geolocation.getCurrentPosition(onSuccess, onError);

	// onSuccess callback accepts a Position object, which contains the current GPS coordinates
	function onSuccess(position) {
		// Get postion data and store in geodata
		geodata.latitude = position.coords.latitude
		geodata.longitude = position.coords.longitude
	}

	// onError Callback receives a PositionError object
	function onError(error) {
		genericErrorHandler(error);
	}

	const filename = "salah-times.json"
	const salahFile = getFile(filename);
	const salahData = null
	
	salahFile == null ?
		genericErrorHandler(`Error occurred while creating File object for ${filename}`)
	: salahData = getFileContent(salahFile);

	salahData == null || salahData == "" ?
		emptySalahFileHandler()
	: (
		timezone != salahData.data[0].meta.timezone ? 
			newTimezoneHandler()
		: null
	)

	function emptySalahFileHandler() {

		// If this is logged before the succesful file read log, then there is async issues
		genericErrorHandler("The file 'salah-times.json' is empty --- Updating 'salah-times.json'...");
		updateSalahData();
	}

	function newTimezoneHandler(){
		genericErrorHandler("The current timezone is different from the saved timezone --- Updating 'salah-times.json'...");
		updateSalahData()
	}

	// console.log("Reading saved-month.json");
	// if (system_month != data.month) {
	// 	updateSalahData(); // if this is called, then the timezone will be automatically updated
	// }

	// Done with all checks, proceed to display part
}

/**
 * Get the File object for the filename passed in
 * @param {String} filename name of the file on the filesystem for which a File object will be returned
 * @returns File object for the corresponding filename. The corresponding file on the filesystem may be populated or empty. Returns null on error.
 */
function getFile(filename) {
	let file = null;

	// Creates a FileSystem object representing the file system the app has permission to use
	window.requestFileSystem(LocalFileSystem.PERSISTENT,0,getFsSuccessHandler,getFsErrorHandler);

	function getFsErrorHandler(evt) {
		genericErrorHandler(evt.target.error.code);
	}

	// Receives a FileSystem object 
	function getFsSuccessHandler(fileSystem) {

		// Creates a FileEntry object representing a file on a file system.
		fileSystem.root.getFile(filename, { create: true }, getFileEntrySuccessHandler, getFileEntryErrorHandler);

		function getFileEntryErrorHandler(error) {
			genericErrorHandler(error)
		}

		// Receives a FileEntry object
		function getFileEntrySuccessHandler(fileEntry) {

			/**
			 * - Creates a File object (not an actual file on the fs) containing file properties. 
			 * - Allows JavaScript to access the file content.
			 * - Represents the current state of the file that the FileEntry represents.
			 */
			fileEntry.file(createFileSuccessHandler, createFileErrorHandler);

			function createFileErrorHandler(error) {
				genericErrorHandler(error.code);
			}

			// Receives a File object
			function createFileSuccessHandler(file) {
				file = file
			}

		}
	}

	return file
}

function getFileContent(file) {

	let data = null;

	// create a FileReader object
	var reader = new FileReader();

	// asynchronously load file data into memory
	console.log(`Starting file read...\n`);
	reader.readAsText(file);

	// set handler for "done loading file data into memory" event
	reader.onloadend = function (event) {
		console.log(`SUCCESSFUL FILE READ:\n${reader.result}\n`);
		data = JSON.parse(reader.result);
	}

	// set handler for a file reading error event
	reader.onerror = function(error) {
		genericErrorHandler(error)
	}

	return data
}

function updateSalahData() {
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
			fs.root.getFile(fname, { create: true, exclusive: false }, function (fileObj) {
				fileObj.createWriter(function (fileWriter) {
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
