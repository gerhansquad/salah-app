import { makeTimestamp } from "../utils/utility"

// let prevData = null

export default function processTodaysDate(data) {
	const rand = Math.random()

	// prevData ? console.log('prevdata: ',JSON.stringify(prevData,null,4),' new data: ',JSON.stringify(data.data,null,4)) : null
	// prevData = data.data

	// array of 'timings' objects
	let currentMonthPrayerData = []
	for (let i = 0; i < data.length; i++) {
		// console.log('each day data: ', JSON.stringify(data.data[i].timings,null,4));
		currentMonthPrayerData[i] = data[i].timings
	}

	// console.log('current month data: ', JSON.stringify(currentMonthPrayerData,null,4));

	// Getting today's day (1-31)
	let currentDate = new Date()
	let currentDay = currentDate.getDate()
	// number (1-31)
	// console.log('current day: ', currentDay);

	// Saving today's prayer data to a variable
	
	// console.log('current day data: ', JSON.stringify(currentMonthPrayerData[0],null,4));
	let currentDayPrayerData = currentMonthPrayerData[currentDay - 1]
	let prevDayPrayerData = currentMonthPrayerData[currentDay - 2]
	 // {"Fajr":"06:04 (PST)","Sunrise":"07:22 (PST)","Dhuhr":"12:10 (PST)",...}
	// console.log('current day data: ', JSON.stringify(currentDayPrayerData,null,4));


	// waqts.forEach(waqt => {
	// 	console.log(`${waqt}:\n`);
	// 	if (typeof currentDayPrayerData[waqt] == "string") {
	// 		console.log(`i am string #${rand}: `, currentDayPrayerData[waqt])
	// 	} else if (typeof currentDayPrayerData[waqt] == "object") {
	// 		console.log(`i am object #${rand}: `, currentDayPrayerData[waqt])
	// 	} else {
	// 		console.log(`i am something else #${rand}`, currentDayPrayerData[waqt]);
	// 	}
	// })


	delete currentDayPrayerData["Sunset"]
	delete currentDayPrayerData["Imsak"]
	// delete prevDayPrayerData["Sunset"]
	// delete prevDayPrayerData["Imsak"]
	prevDayPrayerData = prevDayPrayerData["Midnight"]
	let ptime = prevDayPrayerData.match("[0-9][0-9]:[0-9][0-9]")[0]
	prevDayPrayerData = makeTimestamp(ptime)
	console.log("PREV PRAYER DATA " + JSON.stringify(prevDayPrayerData));
	/**
	 * Pushing each Waqt's prayer time (already sorted) to an array so that
	 * we can determine when in the timeline the system time falls
	 */
	let currentDayPrayerDataArray = []
	let i = 0
	for (const waqt in currentDayPrayerData) {
		// console.log('date object value: ', typeof currentDayPrayerData[waqt]);
		// ["06:04 (PST)","07:22 (PST)","12:10 (PST)",...]
		// currentDayPrayerDataArray[i] = makeTimestamp(currentDayPrayerDataArray[i])
		let time = currentDayPrayerData[waqt].match("[0-9][0-9]:[0-9][0-9]")[0]
		currentDayPrayerDataArray[i] = makeTimestamp(time)
		i++
	}

	currentDayPrayerDataArray = [...currentDayPrayerDataArray, prevDayPrayerData] //inserting prev day's midnight time at the end
	console.log('todays prayer data: ', JSON.stringify(currentDayPrayerDataArray,null,4));

	return currentDayPrayerDataArray
}
