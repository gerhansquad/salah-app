import processTodaysDate from "./processTodaysDate"

export default function updateView(state) {
	let startUpDate = new Date()
	let currentDayPrayerDataArray = null
	let currentDayPrayerData = {}

	const waqts = ["PrevIsha", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "NextFajr"]

	function getNewDayData() {
		currentDayPrayerDataArray = processTodaysDate(state.salah.apiData)
		waqts.map((waqt, index) => {
			let timestamp = currentDayPrayerDataArray[index]
			currentDayPrayerData[waqt] = timestamp
		})
	}

	;(function updateTime() {
		let nIndex = null
		let pIndex = null
		const currentTime = new Date()
		if (
			currentDayPrayerDataArray === null || // app first boots up
			currentTime.getDate() != startUpDate.getDate() // its a new day
		) {
			startUpDate = currentTime
			getNewDayData()
		}

		for (let index = 0; index < currentDayPrayerDataArray.length; index++) {
			if (currentTime < currentDayPrayerDataArray[index]) {
				nIndex = index
				pIndex = index - 1
				break
			}
		}

		const nextPrayerTimestamp = currentDayPrayerDataArray[nIndex]
		const prevPrayerTimestamp = currentDayPrayerDataArray[pIndex]

		// console.log('prev prayer timestamp: ', prevPrayerTimestamp);
		// console.log('current timestamp: ', currentTime);
		// console.log('next prayer timestamp: ', nextPrayerTimestamp);

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
		// remove splash screen and show the app
		// $("#splash-screen").css("display", "none")
		// $("#app-container").css("display", "flex")
		setTimeout(updateTime, 1000)
	})()
	// navigator.splashscreen.hide()
}
