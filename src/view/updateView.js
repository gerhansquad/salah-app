import { makeTimestamp, getKeyByValue } from "../utils/utility";
import processDate from "./processDate"
export function updateView(salahObj) {
	let {currentDate, currentDayPrayerData, currentDayPrayerDataArray } = processDate(salahObj)
	
	let currentHour = currentDate.getHours()
	let currentMinute = currentDate.getMinutes()

	let prayerIndex = currentDayPrayerDataArray.indexOf(currentDate)

	let currentPrayerIndex = prayerIndex == 0 ? currentDayPrayerDataArray.length - 1 : prayerIndex - 1
	let currentPrayerTime = currentDayPrayerDataArray[currentPrayerIndex]

	let nextPrayerIndex = prayerIndex == currentDayPrayerDataArray.length - 1 ? 0 : prayerIndex + 1
	let nextPrayerTime = currentDayPrayerDataArray[nextPrayerIndex]

	for (const waqt in currentDayPrayerData) {
		// console.log(currentDayPrayerData[waqt]);
		currentDayPrayerData[`${waqt}`] = makeTimestamp(String(currentDayPrayerData[waqt]).match("[0-9][0-9]:[0-9][0-9]")[0])
		// console.log(`2nd line: ${currentDayPrayerData[`${waqt}`]}`);
		// console.log(`${waqt}: ${currentDayPrayerData[`${waqt}`]}`)
	}

	// Displaying the current and next prayers
	$("#first-prayer").text(getKeyByValue(currentDayPrayerData, currentPrayerTime))
	$("#second-prayer").text(`left until ${getKeyByValue(currentDayPrayerData, nextPrayerTime)}`)

	// getting the time in ms and taking account of 0 hour value
	let nextPrayerTimeHour = nextPrayerTime.getHours() == 0 ? 24 : nextPrayerTime.getHours()
	let nextPrayerTimeinMs = nextPrayerTimeHour * 60 * 60 * 1000 + nextPrayerTime.getMinutes() * 60 * 1000
	let currentTimeinMs = currentHour * 60 * 60 * 1000 + currentMinute * 60 * 1000

	//calculating the final time in ms
	let finalTimeInMs = nextPrayerTimeinMs - currentTimeinMs

	// getting the final hour and minutes
	let hoursDifference = Math.floor(finalTimeInMs / 1000 / 60 / 60)
	let minutesDifference = Math.floor(finalTimeInMs / 1000 / 60) - hoursDifference * 60

	// Displaying the time left
	$("#time-left").text(`${hoursDifference}h${minutesDifference}m`)
}
