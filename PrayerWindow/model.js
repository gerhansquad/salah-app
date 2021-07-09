import { genericErrorHandler } from "../utils/utility";

let system_month
let timezone
let geodata = {}

export function loadPrayerData() {

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

	onGetFileEntries((fileEntries) => {
		console.log("CALLBACK RECEIVED: "+ JSON.stringify(fileEntries, null, 4));
		if(fileEntries[0].name == "saved-month.json") [fileEntries[0], fileEntries[1]] = [fileEntries[1], fileEntries[0]];
		// read salah-times.json
		onGetFileContent(fileEntries[0], (salah_data) => {
			console.log("SALAH DATA 1: "+ JSON.stringify(salah_data, null, 4));
			// saved-month.json is going to be overwritten anyway
			if (salah_data == null || salah_data == "") {
				console.log("UPDATE FILES 1");
				updateFiles(fileEntries);
			} else {
				// read saved-month.json
				onGetFileContent(fileEntries[1], (month_data) => {
					console.log("SALAH DATA 2: "+ JSON.stringify(salah_data.data[0].meta.timezone));
					if (month_data.month != system_month || timezone != salah_data.data[0].meta.timezone) {
						console.log("UPDATE FILES 2");
						updateFiles(fileEntries);
					} else {
						console.log("NO FILES UPDATED");
					}
				}); 
			}
		});
	});
		
		// onGetFileContent(fileEntries[1], (data) => {
		// 	// isEmptyCheck(data, system_month != data.month)
		// 	data != system_month || timezone != data.data[0].meta.timezone ? updateFiles(fileEntries) : ""
		// });
		// read saved-month.json
		// onGetFileContent(fileEntries[1], (data) => {
		// 	isEmptyCheck(data, system_month != data.month)
		// });

		// function isEmptyCheck(data, condition){
		// 	if(data == null || data == "" || condition) {
		// 		updateFiles(fileEntries)
		// 	}
		// }
	// Done with all checks, proceed to display part

	async function onGetFileEntries(cb) {

	
			let files = []

			let myPromise = new Promise((res, rej) => {
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
						genericErrorHandler(error);
					}
		
					// Receives a FileEntry object
					function getFileEntrySuccessHandler(fileEntry) {
						files.push(fileEntry);
						if(files.length == 2) res(files);
					}
				}
			})

			await myPromise.then((fileArray) => {
				console.log("PROMISE RESOLVED: " + JSON.stringify(fileArray, null, 4));
				cb(fileArray);
			});
			// await myPromise.then((fileEntry) => console.log(`got the file entry: ${fileEntry}`))

		// })();

	
		// Creates a FileSystem object representing the file system the app has permission to use

		
		// wait 2 seconds to let the fileEntry objects be created and pushed into the array, before returning that array
		// setTimeout(() => {
		// 	console.log(`FILE ENTRIES: ${files}`)
		// 	cb(files)
		// },10);
	}

	function onGetFileContent(fileEntry, cb) {

		console.log("FILE ENTRY RECEIVED: "+ JSON.stringify(fileEntry, null, 4));
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
				// console.log(`SUCCESSFUL FILE READ:\n ${reader.result}`);
				// console.log("Trimmed: " + reader.result.trim());
				// console.log("Un-trimmed: " + reader.result);
				if (reader.result.trim() == "") cb(reader.result); // result = ""
				else cb((JSON.parse(reader.result))) // result = "{bla bla bla}"
			}
		
			// set handler for a file reading error event
			reader.onerror = function(error) {
				genericErrorHandler(error);
			}		
		}
	}

	function updateFiles(fileEntries) {

		console.log("FILE ENTRIES RECEIVED: "+ JSON.stringify(fileEntries, null, 4));

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
}

// function createwriteFiles(data) {
// 	window.requestFileSystem(
// 		LocalFileSystem.PERSISTENT,
// 		100000,
// 		function (fs) {
// 			createSalahFile();
// 			createMonthFile();
			
// 			function createSalahFile(){
// 				fs.root.getFile("salah-times.json", { create: true, exclusive: false }, function (fileObj) {
// 					fileObj.createWriter(function (fileWriter) {
// 						console.log("Writing file salah-times");
// 						fileWriter.write(data);

// 						fileWriter.onwriteend = function (event) {
// 							console.log("Successful file write...");
// 						};

// 						fileWriter.onerror = function (e) {
// 							genericErrorHandler(e.toString())
// 						};
// 					});
// 				});
// 			}

// 			function createMonthFile(){
// 				fs.root.getFile("saved-month.json", { create: true, exclusive: false }, function (fileObj) {
// 					fileObj.createWriter(function (fileWriter) {
// 						console.log("Writing file saved-month");
// 						fileWriter.write({ month: system_month });

// 						fileWriter.onwriteend = function (event) {
// 							console.log("Successful file write...");
// 						};

// 						fileWriter.onerror = function (e) {
// 							genericErrorHandler(e.toString())
// 						};
// 					});
// 				});
// 			}
// 		},
// 		function (error) {
// 			genericErrorHandler(Ranrror);
// 		}
// 	);
