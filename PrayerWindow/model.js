import { genericErrorHandler } from "../utils/utility";

let system_month
let timezone
let geodata = {}

export async function loadPrayerData() {

	system_month = new Date().getMonth() + 1
	timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

	// this doesnt work on emulator for some reason
	// navigator.geolocation.getCurrentPosition(onSuccess, onError);
	
	// onSuccess callback accepts a Position object, which contains the current GPS coordinates
	// function onSuccess(position) {
	// 	// Get postion data and store in geodata
	// 	geodata.latitude = position.coords.latitudes
	// 	geodata.longitude = position.coords.longitude
	// 	console.log(`ONSUCCESS GETCURRENTPOSITION: ${position.coords.latitude}, ${position.coords.longitude}`);
	// }

	// onError Callback receives a PositionError object
	// function onError(error) {
	// 	genericErrorHandler(`GEOLOCATION ERROR: ${error}`);
	// }

	let fileEntries = await getFileEntries()
	console.log("FILE ENTRIES RECEIVED: "+ JSON.stringify(fileEntries, null, 4));
	
	// swap
	if(fileEntries[0].name == "saved-month.json") [fileEntries[0], fileEntries[1]] = [fileEntries[1], fileEntries[0]];
	
	// read salah-times.json
	let salah_data = await onGetFileContent(fileEntries[0])
	console.log("SALAH DATA: "+ JSON.stringify(salah_data, null, 4));
	
	// both files are going to be updated if either file is empty or outdated
	if (salah_data == null || salah_data == "") {
		console.log("UPDATE SALAH FILE");
		updateFiles(fileEntries);
	} else {
		// read saved-month.json
		let month_data = await getFileContent(fileEntries[1])
		console.log("MONTH DATA: "+ JSON.stringify(month_data, null, 4));

		if (month_data.month != system_month || timezone != salah_data.data[0].meta.timezone) {
			console.log("UPDATE MONTH FILE");
			updateFiles(fileEntries);
		} else {
			console.log("NO FILES UPDATED");
		} 
	}

	return [
		{
			fname: "",
			file: fileEntries[0],
			data: ""
		},
		{}
	]
}

async function getFileEntries() {    

	let fileEntries = null

	try {
		fileEntries = await getFilePromise()
		console.log("FILE ENTRIES RIGHT HERE: " + fileEntries)
	} catch (error) {
		genericErrorHandler(error);
	}

	function getFilePromise() {
		return new Promise((res, rej) => {

				let files = []

				window.requestFileSystem(LocalFileSystem.PERSISTENT,0,getFsSuccessHandler,getFsErrorHandler);
	
				function getFsErrorHandler(evt) {
					genericErrorHandler(evt.target.error.code);
				}
		
				// Receives a FileSystem object 
				function getFsSuccessHandler(fileSystem) {
		
					// create salah FileEntry object representing the salah file on a file system
					fileSystem.root.getFile("salah-times.json", { create: true }, getFileEntrySuccessHandler, getFileEntryErrorHandler);
		
					// create month FileEntry object representing the month file on a file system
					fileSystem.root.getFile("saved-month.json", { create: true }, getFileEntrySuccessHandler, getFileEntryErrorHandler);

		
					function getFileEntryErrorHandler(error) {
						rej(error)
					}
		
					// Receives a FileEntry object
					function getFileEntrySuccessHandler(fileEntry) {
						files.push(fileEntry);
						if(files.length == 2) res(files);
					}
				}
		});
	}

	return fileEntries

}

async function getFileContent(fileEntry) {

	console.log("FILE GOING TO BE READ: "+ JSON.stringify(fileEntry, null, 4));

	let data = null

	try {
		data = await getFileDataPromise()
	} catch (error) {
		genericErrorHandler(error)
	}

	function getFileDataPromise() {
		return new Promise((res,rej) => {
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
				// create a FileReader object
				var reader = new FileReader();
			
				// asynchronously load file data into memory
				console.log(`Starting file read...\n`);
				reader.readAsText(file);
			
				// set handler for "done loading file data into memory" event
				reader.onloadend = function (event) {
					if (reader.result.trim() == "") res(reader.result); // result = ""
					else res((JSON.parse(reader.result))) // result = "{bla bla bla}"
				}
			
				// set handler for a file reading error event
				reader.onerror = function(error) {
					rej(error);
				}		
			}

		})
	}

	return data
}

function updateFiles(fileEntries) {

	console.log("FILE ENTRIES GONNA UPDATE: "+ JSON.stringify(fileEntries, null, 4));

	const AdhanAPIParams = {
		// latitude: `${geodata.latitude}`,
		// longitude: `${geodata.longitude}`,
		latitude: "25.2048", // dubai geodata
		longitude: "55.2708", // dubai geodata
		method: "2",
	};

	cordova.plugin.http.get(
		"https://api.aladhan.com/v1/calendar",
		AdhanAPIParams,
		{ Authorization: "OAuth2: token" },
		function (response) {
			writeToFile(fileEntries[0], response.data);
			writeToFile(fileEntries[1], { month: system_month } );
			// createwriteFiles(response.data);
		},
		function (response) {
			genericErrorHandler(`API CALL ERROR: ${response.error}`) 
		}
	);
}

function writeToFile(fileEntry, data) {
	fileEntry.createWriter(function (fileWriter) {
		fileWriter.write(data);

		fileWriter.onwriteend = function (event) {
			console.log(`Successful file write to ${fileEntry.name}`);
		};

		fileWriter.onerror = function (e) {
			genericErrorHandler(`ERROR WHILE WRITING TO ${fileEntry.name}: ${e.toString()}`)
		};
	});
}