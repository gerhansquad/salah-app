import { makeTimestamp } from "../utils/utility"

export default function processTodaysDate(data) {
	let currentMonthPrayerData = []
	for (let i = 0; i < data.data.length; i++) {
		currentMonthPrayerData[i] = data.data[i].timings
	}

	// Getting today's day (1-31)
	let currentDate = new Date()
	let currentDay = currentDate.getDate()

	// Saving today's prayer data to a variable
	let currentDayPrayerData = currentMonthPrayerData[currentDay - 1] // {"Fajr":"06:04 (PST)","Sunrise":"07:22 (PST)","Dhuhr":"12:10 (PST)",...}

	// Deleting Sunset as it is the same value as Maghrib
	delete currentDayPrayerData["Sunset"]

	// Deleting Imsak as it didn't come sorted into the right position
	delete currentDayPrayerData["Imsak"]

	/**
	 * Pushing each Waqt's prayer time (already sorted) to an array so that
	 * we can determine when in the timeline the system time falls
	 */
	let currentDayPrayerDataArray = []
	const rand = Math.random()
	for (const waqt in currentDayPrayerData) {
		currentDayPrayerDataArray.push(currentDayPrayerData[waqt])
	}

	insertDateSorted(currentDayPrayerDataArray, currentDate)

	// startUpdating(currentDate, currentDayPrayerData, currentDayPrayerDataArray)
	return { currentDate, currentDayPrayerData, currentDayPrayerDataArray }

	// Inserts a date into a sorted list of dates in the right position
	function insertDateSorted(arr, key) {
		try {
			for (let i = 0; i < arr.length; i++) {
				if (typeof arr[i] != "string") {
					console.log(`i am string #${rand}: `, arr[i])
				} else {
					console.log(`i am object #${rand}: `, arr[i])
				}
				let time = arr[i].match("[0-9][0-9]:[0-9][0-9]")[0]
				arr[i] = makeTimestamp(time)
			}

			let i = arr.length - 1
			while (i >= 0 && arr[i] > key) {
				arr[i + 1] = arr[i]
				i -= 1
			}
			arr[i + 1] = key
			console.log(`everythings fine #${rand}`)
		} catch (error) {
			console.error(`DATE SORTING ERROR: #${rand} `, error)
		}
	}
}
