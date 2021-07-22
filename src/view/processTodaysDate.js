import { makeTimestamp } from "../utils/utility"

// let prevData = null

export default function processTodaysDate(data) {
	const rand = Math.random()

	// prevData ? console.log('prevdata: ',JSON.stringify(prevData,null,4),' new data: ',JSON.stringify(data.data,null,4)) : null
	// prevData = data.data

	// array of 'timings' objects
	let currentMonthPrayerData = []
	// for (let i = 0; i < data.length; i++) {
	// 	// console.log('each day data: ', JSON.stringify(data.data[i].timings,null,4));
	// 	currentMonthPrayerData[i] = data[i].timings
	// }
	data.map((time, i) => {
		currentMonthPrayerData[i] = time.timings
	})

	// console.log('current month data: ', JSON.stringify(currentMonthPrayerData,null,4));

	// Getting today's day (1-31)
	let currentDate = new Date()
	let currentDay = currentDate.getDate()
	// number (1-31)
	// console.log('current day: ', currentDay);

	// Saving today's prayer data to a variable
	
	// console.log('current day data: ', JSON.stringify(currentMonthPrayerData[0],null,4));
	let prevDayPrayerData = currentMonthPrayerData[currentDay - 2]
	let currentDayPrayerData = currentMonthPrayerData[currentDay - 1]
	let nextDayPrayerData = currentMonthPrayerData[currentDay]
	 // {"Fajr":"06:04 (PST)","Sunrise":"07:22 (PST)","Dhuhr":"12:10 (PST)",...}
	// console.log('current day data: ', JSON.stringify(currentDayPrayerData,null,4));

	delete currentDayPrayerData["Sunset"]
	delete currentDayPrayerData["Imsak"]
	delete currentDayPrayerData["Midnight"]
	delete currentDayPrayerData["Sunrise"]
	// deleting these timings as its not needed
	console.log('prayer data before combining: ', JSON.stringify(currentDayPrayerData,null,4));

	prevDayPrayerData = prevDayPrayerData["Isha"] //prev day's isha time
	nextDayPrayerData = nextDayPrayerData["Fajr"] //next day's fajr time
	
	console.log('prev isha prayer data: ', JSON.stringify(prevDayPrayerData,null,4));
	console.log('next fajr prayer data: ', JSON.stringify(nextDayPrayerData,null,4));

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
	prevDayPrayerData = makeTimestamp(prevDayPrayerData.match("[0-9][0-9]:[0-9][0-9]")[0])
	nextDayPrayerData = makeTimestamp(nextDayPrayerData.match("[0-9][0-9]:[0-9][0-9]")[0])
	currentDayPrayerDataArray = [...currentDayPrayerDataArray, prevDayPrayerData, nextDayPrayerData]

	console.log('todays prayer data: ', JSON.stringify(currentDayPrayerDataArray,null,4));

	return currentDayPrayerDataArray
}
