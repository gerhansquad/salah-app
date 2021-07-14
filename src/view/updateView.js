import { makeTimestamp, getKeyByValue } from "../utils/utility"
import processTodaysDate from "./processTodaysDate"

export default function updateView(state) {
	if (state.salah.data != null) {
		let { currentDate, // current timestamp
			// currentDayPrayerData, // 1 object literal with 7 key-value pairs where the value is a string
			currentDayPrayerDataArray // list of sorted timestamps for each of todays prayers (list of objects)
		} = processTodaysDate(state.salah.data)
		console.log("GOT TODAYS DATA " + JSON.stringify({ currentDate, currentDayPrayerDataArray }))

		// get hour and min = 04:32
		// currentprayerdataarray   03:47
		// asr 04:34 -> next prayer

		// 01:47 02:47 03:47 04:47 05:47 06:47 07:47 
		
		const currentDayPrayerData = {}
		const waqts = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha','Midnight']

		for (let index = 0; index < waqts.length; index++) {
			const waqt = waqts[index]
			const timestamp = currentDayPrayerDataArray[index]
			currentDayPrayerData[timestamp] = waqt
		}
		console.log("NEW WAQT OBJ : " + JSON.stringify(currentDayPrayerData, null, 4));

		let nextPrayerIndex = null
		let prevPrayerTimestamp = null
		let nextPrayerTimestamp = null
		for (let index = 0; index < currentDayPrayerDataArray.length; index++) {
			nextPrayerTimestamp = currentDayPrayerDataArray[index];
			prevPrayerTimestamp = currentDayPrayerDataArray[index-1];
			if (currentDate < nextPrayerTimestamp) {
				// console.log('current timestamp: ',currentDate);
				// console.log('prayer timestamp: ',nextPrayerTimestamp);
				nextPrayerIndex = index
				break
			}
		}
		// console.log('outside prayer timestamp: ', nextPrayerTimestamp);

		$("#first-prayer").text(currentDayPrayerData[prevPrayerTimestamp])

		// console.log('current waqt: ',currentDayPrayerData[nextPrayerTimestamp]);

		//calculating the final time in ms
		let timeLeftInMs = nextPrayerTimestamp - currentDate

		// getting the final hour and minutes
		let hoursDifference = Math.floor(timeLeftInMs / 1000 / 60 / 60)
		let minutesDifference = Math.floor(timeLeftInMs / 1000 / 60) - hoursDifference * 60

		// Displaying the time left
		$("#time-left").text(`${hoursDifference}h${minutesDifference}m`)
		$("#second-prayer").text(`left until ${currentDayPrayerData[nextPrayerTimestamp]}`)

		// console.log('current waqt: ',getKeyByValue(
		// 	currentDayPrayerData,
		// 	currentDayPrayerDataArray[prayerTimestamp])
		// );

		// let prayerIndex = currentDayPrayerDataArray.indexOf(currentDate)

		// let currentPrayerIndex = prayerIndex == 0 ? currentDayPrayerDataArray.length - 1 : prayerIndex - 1
		// let currentPrayerTime = currentDayPrayerDataArray[currentPrayerIndex]

		// let nextPrayerIndex = prayerIndex == currentDayPrayerDataArray.length - 1 ? 0 : prayerIndex + 1
		// let nextPrayerTime = currentDayPrayerDataArray[nextPrayerIndex]

		// // for (const waqt in currentDayPrayerData) {
		// // 	console.log("EACH WAQT BEFORE TIMESTAMP: ",currentDayPrayerData[waqt]);
		// // 	currentDayPrayerData[`${waqt}`] = makeTimestamp(String(currentDayPrayerData[waqt]).match("[0-9][0-9]:[0-9][0-9]")[0])
		// // 	console.log("EACH WAQT AFTER TIMESTAMP: ",currentDayPrayerData[waqt]);
		// // 	// console.log(`2nd line: ${currentDayPrayerData[`${waqt}`]}`);
		// // 	// console.log(`${waqt}: ${currentDayPrayerData[`${waqt}`]}`)
		// // }

		// console.log(`test data: `,JSON.stringify(currentDayPrayerData,null,4), JSON.stringify(currentPrayerTime,null,4));
		// // Displaying the current and next prayers
		// $("#first-prayer").text(getKeyByValue(currentDayPrayerData, currentPrayerTime))
		// $("#second-prayer").text(`left until ${getKeyByValue(currentDayPrayerData, nextPrayerTime)}`)

		// let currentHour = currentDate.getHours()
		// let currentMinute = currentDate.getMinutes()

		// // getting the time in ms and taking account of 0 hour value
		// let nextPrayerTimeHour = nextPrayerTime.getHours() == 0 ? 24 : nextPrayerTime.getHours()
		// let nextPrayerTimeinMs = nextPrayerTimeHour * 60 * 60 * 1000 + nextPrayerTime.getMinutes() * 60 * 1000
		// let currentTimeinMs = currentHour * 60 * 60 * 1000 + currentMinute * 60 * 1000

		// //calculating the final time in ms
		// let finalTimeInMs = nextPrayerTimeinMs - currentTimeinMs

		// // getting the final hour and minutes
		// let hoursDifference = Math.floor(finalTimeInMs / 1000 / 60 / 60)
		// let minutesDifference = Math.floor(finalTimeInMs / 1000 / 60) - hoursDifference * 60

		// // Displaying the time left
		// $("#time-left").text(`${hoursDifference}h${minutesDifference}m`)

		// remove splash screen and show the app
		// $("#splash-screen").css("display", "none")
		// $("#app-container").css("display", "flex")
	} else {
		// idk some animation maybe?
	}
}
