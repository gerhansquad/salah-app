import processTodayDate from "../view/prcoessTodayDate"

export default function updateView(state) {
	let startUpDate = new Date()
	let currentDayPrayerData = null
	;(function updateTime() {
		let nIndex = null
		let pIndex = null
		const currentTime = new Date()
		if (
			currentDayPrayerData === null || // app first boots up
			currentTime.getDate() != startUpDate.getDate() // its a new day
		) {
			startUpDate = currentTime
			currentDayPrayerData = processTodayDate(state, currentTime)
		}

		for (let index = 0; index < currentDayPrayerData.length; index++) {
			if (currentTime < currentDayPrayerData[index]) {
				nIndex = index
				pIndex = index - 1
				break
			}
		}

		const nextPrayerTimestamp = currentDayPrayerData[nIndex]
		const prevPrayerTimestamp = currentDayPrayerData[pIndex]

		const last_prayer = waqts[pIndex] == "PrevIsha" ? "Isha" : waqts[pIndex]
		const next_prayer = waqts[nIndex] == "NextFajr" ? "Fajr" : waqts[nIndex]

		$("#first-prayer").text(last_prayer)

		//calculating the final time in ms
		let timeLeftInMs = nextPrayerTimestamp - currentTime

		// getting the final hour and minutes
		let hoursDifference = Math.floor(timeLeftInMs / 1000 / 60 / 60)
		let minutesDifference = Math.floor(timeLeftInMs / 1000 / 60) - hoursDifference * 60

		// Displaying the time left
		$("#time-left").text(`${hoursDifference}h${minutesDifference}m`)
		$("#second-prayer").text(`left until ${next_prayer}`)
		setTimeout(updateTime, 1000)
	})()
	
}
