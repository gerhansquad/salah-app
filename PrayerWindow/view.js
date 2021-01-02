import { makeTimestamp } from "./processing"

export function startUpdating(currentTimestamp, currentDayPrayerData, arr) {
	let num = 0
	setInterval(function () {
		let timer = new Date()
		let currentHour = timer.getHours()
		let currentMinute = timer.getMinutes()

		let prayerIndex = arr.indexOf(currentTimestamp)

		let currentPrayerIndex = prayerIndex == 0 ? arr.length - 1 : prayerIndex - 1
		let currentPrayerTime = arr[currentPrayerIndex]

		let nextPrayerIndex = prayerIndex == arr.length - 1 ? 0 : prayerIndex + 1
		let nextPrayerTime = arr[nextPrayerIndex]

		for (const waqt in currentDayPrayerData) {
			// console.log(currentDayPrayerData[waqt]);
			currentDayPrayerData[`${waqt}`] = makeTimestamp(String(currentDayPrayerData[waqt]).match("[0-9][0-9]:[0-9][0-9]")[0])
			// console.log(`2nd line: ${currentDayPrayerData[`${waqt}`]}`);
			// console.log(`${waqt}: ${currentDayPrayerData[`${waqt}`]}`)
		}

		$("#first-prayer").text(getKeyByValue(currentDayPrayerData, currentPrayerTime))
		$("#second-prayer").text(`left until ${getKeyByValue(currentDayPrayerData, nextPrayerTime)}`)

		let hourInMs = nextPrayerTime.getHours() * 60 * 60 * 1000 - currentHour * 60 * 60 * 1000
		let minInMs = nextPrayerTime.getMinutes() * 60 * 1000 - currentMinute * 60 * 1000

		let hoursDifference = Math.floor(hourInMs / 1000 / 60 / 60)
		let minutesDifference = Math.floor(minInMs / 1000 / 60)
		$("#time-left").text(`${hoursDifference}h${minutesDifference}m`)
	}, 1000)

	function getKeyByValue(object, value) {
		return Object.keys(object).find((key) => object[key] == `${value}`)
	}
}
