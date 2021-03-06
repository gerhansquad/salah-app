import { makeTimestamp, genericErrorHandler } from "../utils/utility"


export default function processDate(salahObj) {

	let currentDay
	let currentDate
	let currentDayPrayerData
	let currentDayPrayerDataArray = []
		salahObj ? (() => {
			const data = salahObj.data
			console.log("SALAH OBJ DATA SIZE" + data.data.length)
			let currentMonthPrayerData = {}
			for (var i = 0; i < data.data.length; i++) {
				currentMonthPrayerData[`${i}`] = data.data[i].timings
			}
		
			// Getting today's day (1-31)
			currentDate = new Date()
			currentDay = currentDate.getDate()
		
			// Saving today's prayer data to a variable
			currentDayPrayerData = currentMonthPrayerData[`${currentDay}`] // {"Fajr":"06:04 (PST)","Sunrise":"07:22 (PST)","Dhuhr":"12:10 (PST)",...}
		
			// Deleting Sunset as it is the same value as Maghrib
			delete currentDayPrayerData["Sunset"]
		
			// Deleting Imsak as it didn't come sorted into the right position
			delete currentDayPrayerData["Imsak"]
		
			/**
			 * Pushing each Waqt's prayer time (already sorted) to an array so that
			 * we can determine when in the timeline the system time falls
			 */
			for (const waqt in currentDayPrayerData) {
				currentDayPrayerDataArray.push(currentDayPrayerData[waqt])
			}
			console.log("I AM HERE 1");
			insertDateSorted(currentDayPrayerDataArray, currentDate)
			console.log("I AM HERE 3");
			// startUpdating(currentDate, currentDayPrayerData, currentDayPrayerDataArray)
		})() : null

	

	console.log("RETURNING: " + JSON.stringify({ currentDate, currentDayPrayerData, currentDayPrayerDataArray }));
	return {currentDate, currentDayPrayerData, currentDayPrayerDataArray}
}
// Inserts a date into a sorted list of dates in the right position
function insertDateSorted(arr, key) {
	console.log("I AM HERE 2");
	try {
		for (let i = 0; i < arr.length; i++) {
			let time = arr[i].match("[0-9][0-9]:[0-9][0-9]")[0]
			arr[i] = makeTimestamp(time)
		}

		let i = arr.length - 1
		while (i >= 0 && arr[i] > key) {
			arr[i + 1] = arr[i]
			i -= 1
		}
		arr[i + 1] = key
	} catch (error) {
		genericErrorHandler(error, 'DATE SORTING ERROR')
	}
}
