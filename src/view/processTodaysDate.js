import { makeTimestamp } from "../utils/utility"

export default function processTodaysDate(data) {
	// array of 'timings' objects
	let currentMonthPrayerData = []

	data.map((time, i) => {
		currentMonthPrayerData[i] = time.timings
	})
	// {"Fajr":"06:04 (PST)","Sunrise":"07:22 (PST)","Dhuhr":"12:10 (PST)",...}

	// Getting today's day (1-31)
	let currentDate = new Date()
	let currentDay = currentDate.getDate()

	let prevDayPrayerData = currentMonthPrayerData[currentDay - 2]
	let currentDayPrayerData = currentMonthPrayerData[currentDay - 1]
	let nextDayPrayerData = currentMonthPrayerData[currentDay]

	// deleting these timings as its not needed
	delete currentDayPrayerData["Sunset"]
	delete currentDayPrayerData["Imsak"]
	delete currentDayPrayerData["Midnight"]
	delete currentDayPrayerData["Sunrise"]

	prevDayPrayerData = prevDayPrayerData["Isha"] //prev day's isha time
	nextDayPrayerData = nextDayPrayerData["Fajr"] //next day's fajr time

	console.log("prayer data before combining: ", JSON.stringify(currentDayPrayerData, null, 4))

	console.log("prev isha prayer data: ", JSON.stringify(prevDayPrayerData, null, 4))
	console.log("next fajr prayer data: ", JSON.stringify(nextDayPrayerData, null, 4))

	/**
	 * Pushing each Waqt's prayer time (already sorted) to an array so that
	 * we can determine when in the timeline the system time falls
	 */
	let currentDayPrayerDataArray = []
	let i = 0

	for (const waqt in currentDayPrayerData) {
		let time = currentDayPrayerData[waqt].match("[0-9][0-9]:[0-9][0-9]")[0]
		currentDayPrayerDataArray[i] = makeTimestamp(time)
		i++
	}

	let prevIshaTimestamp = makeTimestamp(prevDayPrayerData.match("[0-9][0-9]:[0-9][0-9]")[0])
	prevIshaTimestamp.setDate(prevIshaTimestamp.getDate() - 1)

	let nextFajrTimestamp = makeTimestamp(nextDayPrayerData.match("[0-9][0-9]:[0-9][0-9]")[0])
	nextFajrTimestamp.setDate(nextFajrTimestamp.getDate() + 1)

	currentDayPrayerDataArray = [prevIshaTimestamp, ...currentDayPrayerDataArray, nextFajrTimestamp]

	console.log("todays prayer data: ", JSON.stringify(currentDayPrayerDataArray, null, 4))

	return currentDayPrayerDataArray
}
