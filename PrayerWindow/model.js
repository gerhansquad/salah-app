import { genericErrorHandler } from "../utils/utility";

let system_month = new Date().getMonth() + 1
let month_data;
let salah_data;
let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone


export async function loadPrayerData() {	

	let fileEntries = await getFileEntries()
	console.log("FILE ENTRIES RECEIVED: "+ JSON.stringify(fileEntries, null, 4));
	
	// swap
	if(fileEntries[0].name == "saved-month.json") [fileEntries[0], fileEntries[1]] = [fileEntries[1], fileEntries[0]];
	const salahFileEntry = fileEntries[0]
	const monthFileEntry = fileEntries[1]

	// read salah-times.json from disk
	salah_data = await getFileContent(salahFileEntry);
	console.log("SALAH FILE DATA: "+ JSON.stringify(salah_data, null, 4));

	async function update() {
		system_month = new Date().getMonth() + 1
		if (month_data.month != system_month || timezone != salah_data.data[0].meta.timezone) {
			console.log("month/timezone change detected\n");
			await updateFiles(fileEntries);
		} else {
			console.log("NO FILES UPDATED");
		} 	
		console.log("CACHED VARS: "+{system_month},{timezone},{fileEntries},{salah_data},{month_data});
		setTimeout(update, 5000);
	}

	// both files are going to be updated if either file is empty or outdated
	if (salah_data == null || salah_data == "") {
		console.log("Both files EMPTY\n");
		await updateFiles(fileEntries);
		// TODO: Make app constantly check for new month and timezone when app opens up with no files
		// await update();
	} else {
		console.log("Both files EXIST\n");
		// read saved-month.json
		month_data = await getFileContent(monthFileEntry)
		console.log("MONTH FILE DATA: "+ JSON.stringify(month_data, null, 4));
		await update();
	}

	return {
		salah: {
			filename: "salah-times.json",
			file: salahFileEntry,
			data: salah_data
		},
		month: {
			filename: "saved-month.json",
			file: monthFileEntry,
			data: month_data // data: system_month
		}
	}
}

async function updateFiles(fileEntries){
	console.log("UPDATING SALAH AND MONTH FILES AND GLOBAL VARS:\n");
	console.log(JSON.stringify(fileEntries, null, 4));

	salah_data = await getApiData();
	month_data = system_month;
	console.log("JUST RECEIVED API DATA: "+JSON.stringify([salah_data,month_data], null, 4));
	
	try {
		writeToFile(fileEntries[0], salah_data);
		writeToFile(fileEntries[1], { month: month_data });
	} catch (error) {
		console.error("ERROR WHILE WRITING TO FILE");
		genericErrorHandler(error);
	}
}

async function getFileEntries() {    

	let fileEntries = null

	try {
		fileEntries = await getFilePromise()
		console.log("GOT FILE ENTRIES: " + fileEntries)
		return fileEntries;
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
}

async function getFileContent(fileEntry) {

	console.log("FILE GOING TO BE READ: "+ JSON.stringify(fileEntry, null, 4));

	let data = null

	try {
		data = await getFileDataPromise()
		return data;
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

}

async function getApiData() {
	let data = null;
	console.log("GETTING API DATA");

	function locationReqPromise(){
		return new Promise((res,rej) => {
			let geodata = {};
			navigator.geolocation.getCurrentPosition(onSuccess, onError);
			
			// onSuccess callback accepts a Position object, which contains the current GPS coordinates
			function onSuccess(position) {
				// Get postion data and store in geodata
				geodata.latitude = position.coords.latitudes
				geodata.longitude = position.coords.longitude
				console.log(`ONSUCCESS GET CURRENT POSITION: ${position.coords.latitude}, ${position.coords.longitude}`);
				res(geodata)
			}
		
			// onError Callback receives a PositionError object
			function onError(error) {
				rej(`GEOLOCATION ERROR: ${error}`);
			}
		})
	}
	// this doesnt work on emulator for some reason

	try {
		// let geodata = await locationReqPromise()
		// console.log("geodata:", geodata)
		data = await apiReqPromise()
	} catch (error) {
		console.error('ERROR WHILE GETTING API DATA');
		genericErrorHandler(error)
		data = await apiReqPromise(null)
	}

	return data

	function apiReqPromise(){
		return new Promise((res, rej) => {
		
			const AdhanAPIParams = {
				// latitude: geodata ? `${geodata.latitude}` : "25.2048",
				// longitude: geodata ? `${geodata.longitude}` : "55.2708",
				latitude: "25.2048", // dubai geodata
				longitude: "55.2708", // dubai geodata
				method: "2",
			};
		
			cordova.plugin.http.get(
				"https://api.aladhan.com/v1/calendar",
				AdhanAPIParams,
				{ Authorization: "OAuth2: token" },
				function (response) {
					res(response.data);
				},
				function (response) {
					rej(`API CALL ERROR: ${response.error}`);
				}
			);
	})};
}

function writeToFile(fileEntry, data) {

	const createWriterSuccessHandler = fileWriter => {
		fileWriter.write(data);

		fileWriter.onwriteend = function (event) {
			console.log(`Successful file write to ${fileEntry.name}`);
		};

		fileWriter.onerror = function (e) {
			genericErrorHandler(`ERROR WHILE WRITING TO ${fileEntry.name}: ${e.toString()}`)
		};
	}

	const createWriterErrorHandler = error => {
		console.error("CREATE FILE WRITER ERROR")
		throw error
	}

	fileEntry.createWriter(createWriterSuccessHandler,createWriterErrorHandler);
}