import { promiseHandler } from "../utils/utility"

let startupMonth = new Date().getMonth() + 1
let system_month = startupMonth

let startupTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

let salahFileData, system_timezone, api_data

export default async function loadPrayerData(state) {
	let salahFileEntry = await getFileEntry()
	console.log("FILE ENTRY RECEIVED: " + JSON.stringify(salahFileEntry, null, 4))
	// read salah-data.json
	salahFileData = await getFileContent(salahFileEntry)
	console.log("SALAH FILE DATA: " + JSON.stringify(salahFileData, null, 4))

	if (salahFileData == null || salahFileData == "") {
		console.log("No FILE DATA. Making API req & overwriting\n")
		// no/empty salahFileData. making api req and updating file
		await updateFilesAndState(salahFileEntry, state)
	} else {
		console.log("SALAH FILE EXISTS\n")
		api_data = salahFileData.apiData
		console.log("SALAH API FILE DATA: " + JSON.stringify(api_data, null, 4))
	}

	state.salah.file = salahFileEntry
	state.salah.apiData = api_data
	console.log("STATE OBJ : " + JSON.stringify(state.salah, null, 4))

	/**
	 * Start constantly checking every second if timezone and/or month has changed.
	 * If it has, update files and state once again.
	 */
	;(async function updateAgain() {
		system_month = new Date().getMonth() + 1
		system_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
		console.log("API MONTH IS : " + api_data[0].date.gregorian.month.number)
		if (
			system_month != startupMonth || // is the current system month different from when the app booted up?
			api_data[0].date.gregorian.month.number != system_month || // is the current system month different from the one in the API
			system_timezone != startupTimezone || // is the current timezone different from when the app booted up?
			system_timezone != api_data[0].meta.timezone // is the current timezone different from the one stored on disk?
		) {
			console.log("month/timezone change detected\n")
			await updateFilesAndState(salahfileEntry, state)
			// here the call to refresh view will be invoked.
		} else {
			console.log("NO FILES UPDATED")
		}
		/**
		 * Wait a second after function is done executing before being run again.
		 * As a result, each function call occurs every 1s + how much ever time it takes to run the function
		 */
		setTimeout(updateAgain, 1000)
	})()
}

async function updateFilesAndState(fileEntry, state) {
	console.log("UPDATING SALAH FILE AND GLOBAL VARS:\n")
	console.log(JSON.stringify(fileEntry, null, 4))

	api_data = JSON.parse(await getApiData(state)).data
	console.log("JUST RECEIVED API DATA" + JSON.stringify(api_data, null, 4))
	state.salah.apiData = api_data

	try {
		// we dont await: optimistic updates (so they might close the app after viewing the data despite it not being saved to disk yet)
		writeToFile(fileEntry, state.salah)
	} catch (error) {
		console.error("ERROR WHILE TRYING TO UPDATE FILE: ", error)
	}
}

async function getFileEntry() {
	console.log("GETTING FILE ENTRY")

	const [FileEntry, error] = await promiseHandler(getFilePromise)
	error ? console.error("ERROR WHILE GETTING FILE ENTRIES: ", error) : null
	return FileEntry

	function getFilePromise(...args) {
		return new Promise((res, rej) => {
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getFsSuccessHandler, getFsErrorHandler)

			function getFsErrorHandler(event) {
				rej(event.target.error.code)
			}

			// Receives a FileSystem object
			function getFsSuccessHandler(fileSystem) {
				// create salah FileEntry object representing the salah file on a file system
				fileSystem.root.getFile("salah-data.json", { create: true }, getFileEntrySuccessHandler, getFileEntryErrorHandler)

				function getFileEntryErrorHandler(error) {
					rej(error)
				}

				// Receives a FileEntry object
				function getFileEntrySuccessHandler(fileEntry) {
					res(fileEntry)
				}
			}
		})
	}
}

async function getFileContent(fileEntry) {
	console.log("FILE GOING TO BE READ: " + JSON.stringify(fileEntry, null, 4))

	const [data, error] = await promiseHandler(getFileDataPromise)
	error ? console.error("ERROR WHILE READING FILE: ", error) : null
	return data

	function getFileDataPromise(...args) {
		/**
		 * - Creates a File object (not an actual file on the fs) containing file properties.
		 * - Allows JavaScript to access the file content.
		 * - Represents the current state of the file that the FileEntry represents.
		 */
		return new Promise((res, rej) => {
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
					else res(JSON.parse(reader.result))
				}

				// set handler for a file reading error event
				reader.onerror = function (error) {
					rej(error)
				}
			}
		})
	}
}

async function getApiData(state) {
	console.log("GETTING API DATA")

	const [geodata, geoError] = await promiseHandler(locationReqPromise)
	geoData
		? (() => {
				state.settings.data.apiParams.latitude = `${geodata.latitude}`
				state.settings.data.apiParams.longitude = `${geodata.longitude}`
		  })()
		: (() => {
				console.error("ERROR WHILE GETTING SYSTEM LOCATION: ", geoError)
				state.salah.settings.apiParams.latitude = "25.2048"
				state.salah.settings.apiParams.longitude = "55.2708"
		  })()

	const [apiData, apiError] = await promiseHandler(apiReqPromise)
	apiError ? console.error("ERROR WHILE GETTING API DATA: ", apiError) : null

	return apiData

	// this doesnt work on emulator for some reason
	function locationReqPromise(...args) {
		return new Promise((res, rej) => {
			let locationData = {}
			navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 200 })
			// let wait = setTimeout(() => {
			// 	clearTimeout(wait)
			// 	rej('Geolocation API timed out after 500ms...')
			// },500)

			// onSuccess callback accepts a Position object, which contains the current GPS coordinates
			function onSuccess(position) {
				// Get postion data and store in geodata
				locationData.latitude = position.coords.latitudes
				locationData.longitude = position.coords.longitude
				console.log(`ONSUCCESS GET CURRENT POSITION: ${position.coords.latitude}, ${position.coords.longitude}`)
				res(locationData)
			}

			function onError(error) {
				rej(error)
			}
		})
	}

	// let geodata = await locationReqPromise()
	// console.log("geodata:", geodata)
	// console.log("API PARAMS ARE" + JSON.stringify(state.salah.settings.apiParams, null, 4))
	// const [data, error] = await promiseHandler(apiReqPromise)
	// error ? console.error("ERROR WHILE GETTING API DATA: ", error) : null
	// data = await apiReqPromise(null)
	// return data

	function apiReqPromise(...args) {
		return new Promise((res, rej) => {
			const AdhanAPIParams = {
				latitude: state.salah.settings.apiParams.latitude,
				longitude: state.salah.settings.apiParams.longitude,
				method: state.salah.settings.apiParams.method,
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
