import processTodaysDate from "./processTodaysDate"

export default function updateView(state) {
	let endOfDay = null
	let currentDayPrayerDataArray = null
	const currentDayPrayerData = {}
	let gotData = false

	function getNewDayData() {
		currentDayPrayerDataArray = processTodaysDate(state.salah.apiData)
		console.log("GOT TODAYS DATA " + JSON.stringify(currentDayPrayerDataArray)) 
		const waqts = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha','Midnight']
		waqts.map((waqt, index) => {
			const timestamp = currentDayPrayerDataArray[index]
			currentDayPrayerData[timestamp] = waqt
		})
			
		console.log("NEW WAQT OBJ : " + JSON.stringify(currentDayPrayerData, null, 4));
		endOfDay = currentDayPrayerDataArray[6]
		console.log("This should be Midnight : " + JSON.stringify(endOfDay));
		gotData = true
	}

	(function updateTime() {
		let currentTime = new Date()
		if (endOfDay == null || gotData != true || currentTime > endOfDay) {
			console.log("endofday is null or data isnt recieved yet or midnight passed");
			getNewDayData()
		} else {
			// idk some animation maybe?
		}

		let nextPrayerIndex = null
		let prevPrayerTimestamp = null
		let nextPrayerTimestamp = null
		for (let index = 0; index < currentDayPrayerDataArray.length; index++) {
			nextPrayerTimestamp = currentDayPrayerDataArray[index];
			prevPrayerTimestamp = currentDayPrayerDataArray[index-1];
			if (currentTime < nextPrayerTimestamp) {
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
		let timeLeftInMs = nextPrayerTimestamp - currentTime

		// getting the final hour and minutes
		let hoursDifference = Math.floor(timeLeftInMs / 1000 / 60 / 60)
		let minutesDifference = Math.floor(timeLeftInMs / 1000 / 60) - hoursDifference * 60

		// Displaying the time left
		$("#time-left").text(`${hoursDifference}h${minutesDifference}m`)
		$("#second-prayer").text(`left until ${currentDayPrayerData[nextPrayerTimestamp]}`)
		// remove splash screen and show the app
		// $("#splash-screen").css("display", "none")
		// $("#app-container").css("display", "flex")
		setTimeout(updateTime, 1000)
	})()
	
}
