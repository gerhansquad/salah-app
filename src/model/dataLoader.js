import { promiseHandler, getFileEntry, getFileContent, writeToFile } from "../utils/utility"
import State from "./SalahData"

let startupYear = new Date().getFullYear()

let startupTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

let salahFileData = null

export default async function loadPrayerData() {

	const state = new State()
	let salahFileEntry = await getFileEntry()
	console.log("FILE ENTRY RECEIVED: " + JSON.stringify(salahFileEntry, null, 4))
	// read salah-data.json
	salahFileData = await getFileContent(salahFileEntry)
	console.log("SALAH FILE DATA: " + JSON.stringify(salahFileData, null, 4))

	if (salahFileData == null || salahFileData == "") {
		console.log("No FILE DATA. Making API req & overwriting\n")
		// no/empty salahFileData. making api req and updating file
		await updateFilesAndState(salahFileEntry, state, true)
	}
	else {
		console.log("SALAH FILE EXISTS\n")
		state.salah = salahFileData
	}
	
	console.log("SALAH FILE DATA: " + JSON.stringify(salahFileData, null, 4))

	console.log("STATE OBJ : " + JSON.stringify(state.salah, null, 4))

	/**
	 * Start constantly checking every second if timezone and/or month has changed.
	 * If it has, update files and state once again.
	 */
	;(async function updateAgain() {
		system_year = new Date().getFullYear()
		if (
			system_year != startupYear // is the current system year different from when the app booted up?
		) {
			console.log("year change detected\n")
			await updateFilesAndState(salahFileEntry, state, false)
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

	return state
}

async function updateFilesAndState(fileEntry, state, dualCall) {
	/* if (dualCall)):
	two api calls simult
	resolve all
	else :
	next year api call
*/
	/**
	 *  Assuming person doesnt open before zuhr on 1st of jan,
	 * 	- when app opens for first time
	 *  currentyear = {...},
	 *  nextYear = {...}
	 *  - when last year's last day's ishaa time has passed
	 *  lastishaatime = currentyear(lastishaa)
	 *  currentYear = nextYear
	 *  nextYear = {...}
	 *  - when its new years zuhr time
	 *  previshaa delete
	 */
	const currentYear = new Date().getFullYear()
	const apiData1, apiData2 
	dualCall ? (() => {
		apiData1 = getApiData(state, currentYear)
		apiData2 = getApiData(state, currentYear+1)
		const api_data = await Promise.all([apiData1,apiData2])
		state.salah.apiData.currentYear = processData(api_data[0])
		state.salah.apiData.nextYear = processData(api_data[1])
	})() : (() => {
		// delete state.salah.apiData[0]
		// api_data = [...(state.salah.apiData), await getApiData(state, currentYear+2)]
		state.salah.apiData.currentYear = state.salah.apiData.nextYear
		state.salah.apiData.lastPrayerTimestamp = state.salah.apiData.currentYear
		apiData1 = await getApiData(state, currentYear+1)
		state.salah.apiData.nextYear = processData(apiData1)
	})()
	// const api_data = JSON.parse(await getApiData(state, dualCall)).data
	// state.salah.apiData = process(api_data) // process(apiData)
	

	state.salah.file = fileEntry

	try {
		// we dont await: optimistic updates (so they might close the app after viewing the data despite it not being saved to disk yet)
		writeToFile(fileEntry, state.salah)
	} catch (error) {
		console.error("ERROR WHILE TRYING TO UPDATE FILE: ", error)
	}
}

async function getApiData(state, year) {
	console.log("GETTING API DATA")
	// Gets location of the device in terms of lats and longs (We should move this function to the deviceready fn)
	const [geoData, error] = await promiseHandler(locationReqPromise)
	geoData
		? (() => {
				state.settings.data.apiParams.latitude = `${geoData.latitude}`
				state.settings.data.apiParams.longitude = `${geoData.longitude}`
		  })()
		: (() => {
				console.error("ERROR WHILE GETTING SYSTEM LOCATION: ", error, " - SETTING DEFAULT LOCATION: UAE")
				state.salah.apiParams.latitude = "25.2048" // for testing 
				state.salah.apiParams.longitude = "55.2708" // for testing
		  })()

	// Do autodetect only if it is enabled
	state.salah.settings.autoDetect && (() => {state.salah.apiParams.method = "null"})()

	// const currentYear = new Date().getFullYear()
	// async function resolveApiCalls(){
	// 	// Fetches api data
	// 	const [apiData1, apiError1] = promiseHandler(apiReqPromise,currentYear)
	// 	const [apiData2, apiError2] = promiseHandler(apiReqPromise,currentYear+1)
	// 	apiError1 && console.error("ERROR WHILE GETTING API DATA: ", apiError1)
	// 	apiError2 && console.error("ERROR WHILE GETTING API DATA: ", apiError2) 
		
	// 	return Promise.all([apiData1,apiData2])
	// }

	const [apiData,apiError] = /*dualCall ? await promiseHandler(resolveApiCalls) :**/ await promiseHandler(apiReqPromise)
	apiError && console.error("ERROR WHILE GETTING API DATA: ", apiError)

	return apiData
	// this doesnt work on emulator for some reason
	function locationReqPromise(...args) {
		return new Promise((res, rej) => {
			let locationData = {}
			navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 200 })
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

	function apiReqPromise(...args) {
		return new Promise((res, rej) => {

			const AdhanAPIParams = {
				latitude: state.salah.apiParams.latitude,
				longitude: state.salah.apiParams.longitude,
				method: state.salah.apiParams.method,
				school: state.salah.apiParams.school,
				year: `${year}`,
				annual: "true"
			}

			cordova.plugin.http.get(
				"https://api.aladhan.com/v1/		",
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
