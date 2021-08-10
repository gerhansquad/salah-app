import { promiseHandler, getFileEntry, getFileContent, writeToFile } from "../utils/utility"
import State from "./SalahData"
import CodeDict from '../shared/codes.json'

// let startupMonth = new Date().getMonth() + 1
// let system_month = startupMonth

let startupTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

let salahFileData, system_timezone, api_data

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
	
	console.log("SALAH API FILE DATA: " + JSON.stringify(api_data, null, 4))

	console.log("STATE OBJ : " + JSON.stringify(state.salah, null, 4))

	/**
	 * Start constantly checking every second if timezone and/or month has changed.
	 * If it has, update files and state once again.
	 */
	;(async function updateAgain() {
		// system_month = new Date().getMonth() + 1
		system_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
		// console.log("API MONTH IS : " + api_data[0].date.gregorian.month.number)
		if (
			// system_month != startupMonth || // is the current system month different from when the app booted up?
			// api_data[0].date.gregorian.month.number != system_month || // is the current system month different from the one in the API
			system_timezone != startupTimezone || // is the current timezone different from when the app booted up?
			system_timezone != api_data[0].meta.timezone // is the current timezone different from the one stored on disk?
		) {
			console.log("month/timezone change detected\n")
			await updateFilesAndState(salahFileEntry, state, true)
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
	if (dualCall) {
		const apiData1 = getApiData(state, currentYear)
		const apiData2 = getApiData(state, currentYear+1)
		const api_data = await Promise.all([apiData1,apiData2])
		state.salah.apiData.currentYear = processData(api_data[0])
		state.salah.apiData.nextYear = processData(api_data2[1])
	} else {
		// delete state.salah.apiData[0]
		// api_data = [...(state.salah.apiData), await getApiData(state, currentYear+2)]
		api_data = await getApiData(state, currentYear+2)
		state.salah.apiData.nextYear = processData(api_data)
	}
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
				state.salah.settings.apiParams.latitude = "25.2048" // for testing 
				state.salah.settings.apiParams.longitude = "55.2708" // for testing
		  })()

	// Do autodetect only if it is enabled
	if (state.salah.settings.autoDetect) {
		const [detectedMethod, methodError] = await promiseHandler(autoDetectPromise)
		methodError && console.error("ERROR WHILE DETECTING METHOD: ", methodError) 
		state.salah.settings.apiParams.method = detectedMethod
	}

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

	function autoDetectPromise() {
		return new Promise((res, rej) => {
				console.log("AUTODetect doing its thing");
				nativegeocoder.reverseGeocode(success, failure, state.salah.settings.apiParams.latitude, state.salah.settings.apiParams.longitude, { useLocale: true, maxResults: 1 });
			
				function success(result) {
				const code = result[0].countryCode;
				console.log("Country Code: " + JSON.stringify(code));
				console.log(CodeDict[code]);
				res(CodeDict[code])
				}
			
				function failure(err) {
				rej(err)
				}
		})
	}

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
				latitude: state.salah.settings.apiParams.latitude,
				longitude: state.salah.settings.apiParams.longitude,
				method: state.salah.settings.apiParams.method,
				school: state.salah.settings.apiParams.school,
				year: `${year}`
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
