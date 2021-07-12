import { genericErrorHandler, promiseHandler } from "../utils/utility"

let startupMonth = new Date().getMonth() + 1
let system_month = startupMonth

let startupTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

let month_data, salah_data, system_timezone

export default async function loadPrayerData() {
	let fileEntries = await getFileEntries()
	console.log("FILE ENTRIES RECEIVED: " + JSON.stringify(fileEntries, null, 4))

	// swap
	if (fileEntries[0].name == "saved-month.json") [fileEntries[0], fileEntries[1]] = [fileEntries[1], fileEntries[0]]

	const salahFileEntry = fileEntries[0]
	const monthFileEntry = fileEntries[1]

	// read salah-times.json from disk
	salah_data = await getFileContent(salahFileEntry)
	console.log("SALAH FILE DATA: " + JSON.stringify(salah_data, null, 4))

	if (salah_data == null || salah_data == "") {
		console.log("Both files EMPTY\n")
		// both files are empty so update both files
		await updateFilesAndState(fileEntries)
		// here the call to refresh view will be invoked.
	} else {
		console.log("Both files EXIST\n")
		// both files exist but we havent update month_data from disk yet so do that: optimisation over structure
		month_data = await getFileContent(monthFileEntry)
		console.log("MONTH FILE DATA: " + JSON.stringify(month_data, null, 4))
	}

	/**
	 * Start constantly checking every second if timezone and/or month has changed.
	 * If it has, update files and state once again.
	 * TODO: But are we returning these new values to the view? I dont think so.
	 */
	async function update () {
		// TODO: should i not await? nah not needed because the part which is async (updatefilesandstate) is already on await so we should be fine.
		system_month = new Date().getMonth() + 1
		system_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
		if (
			system_month != startupMonth || // is the current system month different from when the app booted up?
			month_data.month != system_month || // is the current system month different from the one stored on disk?
			system_timezone != startupTimezone || // is the current timezone different from when the app booted up?
			system_timezone != salah_data.data[0].meta.timezone // is the current timezone different from the one stored on disk?
		) {
			console.log("month/timezone change detected\n")
			await updateFilesAndState(fileEntries)
			// here the call to refresh view will be invoked.
		} else {
			console.log("NO FILES UPDATED")
		}
		/**
		 * Wait a second after function is done executing before being run again.
		 * As a result, each function call occurs every 1s + how much ever time it takes to run the function
		 */
		setTimeout(update, 60000)
	}
	update();

	return {
		salah: {
			filename: "salah-times.json",
			file: salahFileEntry,
			data: salah_data,
		},
		month: {
			filename: "saved-month.json",
			file: monthFileEntry,
			data: month_data, // data: system_month
		},
	}
}

async function updateFilesAndState(fileEntries) {
	console.log("UPDATING SALAH AND MONTH FILES AND GLOBAL VARS:\n")
	console.log(JSON.stringify(fileEntries, null, 4))

	salah_data = await getApiData()
	month_data = { month: system_month }
	console.log("JUST RECEIVED API DATA: " + JSON.stringify([salah_data, month_data], null, 4))

	try {
		// we dont await: optimistic updates
		writeToFile(fileEntries[0], salah_data)
		writeToFile(fileEntries[1], month_data)
	} catch (error) {
		genericErrorHandler("ERROR WHILE TRYING TO UPDATE FILE\n", error)
	}
}

async function getFileEntries() {
	console.log("GETTING FILE ENTRIES")

	const [fileEntries, error] = await promiseHandler(getFilePromise)
	error ? genericErrorHandler("ERROR WHILE GETTING FILE ENTRIES\n", error) : null
	return fileEntries

	function getFilePromise(...args) {
		return new Promise((res, rej) => {
			let files = []

			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getFsSuccessHandler, getFsErrorHandler)

			function getFsErrorHandler(event) {
				rej(event.target.error.code)
			}

			// Receives a FileSystem object
			function getFsSuccessHandler(fileSystem) {
				// create salah FileEntry object representing the salah file on a file system
				fileSystem.root.getFile("salah-times.json", { create: true }, getFileEntrySuccessHandler, getFileEntryErrorHandler)

				// create month FileEntry object representing the month file on a file system
				fileSystem.root.getFile("saved-month.json", { create: true }, getFileEntrySuccessHandler, getFileEntryErrorHandler)

				function getFileEntryErrorHandler(error) {
					rej(error)
				}

				// Receives a FileEntry object
				function getFileEntrySuccessHandler(fileEntry) {
					files.push(fileEntry)
					if (files.length == 2) res(files)
				}
			}
		})
	}
}

async function getFileContent(fileEntry) {
	console.log("FILE GOING TO BE READ: " + JSON.stringify(fileEntry, null, 4))

	const [data, error] = await promiseHandler(getFileDataPromise)
	error ? genericErrorHandler("ERROR WHILE READING FILE:\n", error) : null
	return data

	function getFileDataPromise(...args) {
		return new Promise((res, rej) => {
			/**
			 * - Creates a File object (not an actual file on the fs) containing file properties.
			 * - Allows JavaScript to access the file content.
			 * - Represents the current state of the file that the FileEntry represents.
			 */
			fileEntry.file(createFileSuccessHandler, createFileErrorHandler)

			function createFileErrorHandler(error) {
				rej(error)
			}

			// Receives a File object
			function createFileSuccessHandler(file) {
				// create a FileReader object
				var reader = new FileReader()

				// asynchronously load file data into memory
				console.log(`Starting file read...\n`)
				reader.readAsText(file)

				// set handler for "done loading file data into memory" event
				reader.onloadend = function (event) {
					if (reader.result.trim() == "") res(reader.result)
					// result = ""
					else res(JSON.parse(reader.result)) // result = "{bla bla bla}"
				}

				// set handler for a file reading error event
				reader.onerror = function (error) {
					rej(error)
				}
			}
		})
	}
}

async function getApiData() {
	console.log("GETTING API DATA")

	// function locationReqPromise() {
	// 	return new Promise((res, rej) => {
	// 		let geodata = {}
	// 		navigator.geolocation.getCurrentPosition(onSuccess, onError)

	// 		// onSuccess callback accepts a Position object, which contains the current GPS coordinates
	// 		function onSuccess(position) {
	// 			// Get postion data and store in geodata
	// 			geodata.latitude = position.coords.latitudes
	// 			geodata.longitude = position.coords.longitude
	// 			console.log(
	// 				`ONSUCCESS GET CURRENT POSITION: ${position.coords.latitude}, ${position.coords.longitude}`
	// 			)
	// 			res(geodata)
	// 		}

	// 		// onError Callback receives a PositionError object
	// 		function onError(error) {
	// 			rej(`GEOLOCATION ERROR: ${error}`)
	// 		}
	// 	})
	// }
	// this doesnt work on emulator for some reason

	// let geodata = await locationReqPromise()
	// console.log("geodata:", geodata)
	const [data, error] = await promiseHandler(apiReqPromise)
	error ? genericErrorHandler("ERROR WHILE GETTING API DATA:\n", error) : null
	// data = await apiReqPromise(null)
	return data

	function apiReqPromise(...args) {
		return new Promise((res, rej) => {
			const AdhanAPIParams = {
				// latitude: geodata ? `${geodata.latitude}` : "25.2048",
				// longitude: geodata ? `${geodata.longitude}` : "55.2708",
				latitude: "25.2048", // dubai geodata
				longitude: "55.2708", // dubai geodata
				method: "2",
			}

			cordova.plugin.http.get(
				"https://api.aladhan.com/v1/calendar",
				AdhanAPIParams,
				{ Authorization: "OAuth2: token" },
				(response) => {
					res(response.data)
				},
				(response) => {
					rej(response.error)
				}
			)
		})
	}
}

function writeToFile(fileEntry, data) {
	const createWriterSuccessHandler = (fileWriter) => {
		fileWriter.onwriteend = (event) => {
			console.log(`Successful file write to ${fileEntry.name}`)
		}

		fileWriter.onerror = (error) => {
			throw error
		}

		fileWriter.write(data)
	}

	const createWriterErrorHandler = (error) => {
		throw error
	}

	fileEntry.createWriter(createWriterSuccessHandler, createWriterErrorHandler)
}
