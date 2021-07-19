import processTodaysDate from "./processTodaysDate"

export default function updateView(state) {
	let endOfDay = null
	let currentDayPrayerDataArray = null
	let currentDayPrayerData = {}
	let gotData = false
	const waqts = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha','Midnight','PrevMidnight']
	function getNewDayData() {
		currentDayPrayerDataArray = processTodaysDate(state.salah.apiData)
		console.log("GOT TODAYS DATA " + JSON.stringify(currentDayPrayerDataArray, null, 4)) 
		
		
		waqts.map((waqt, index) => {
			let timestamp = currentDayPrayerDataArray[index]
			currentDayPrayerData[waqt] = timestamp
			console.log("Adding " + JSON.stringify(currentDayPrayerData, null , 4));
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

		let cIndex = null
		let pIndex = null
		let prevPrayerTimestamp = null
		let nextPrayerTimestamp = null
		for (let index = 0; index < currentDayPrayerDataArray.length-1; index++) {
			nextPrayerTimestamp = currentDayPrayerDataArray[index];
			prevPrayerTimestamp = currentDayPrayerDataArray[index-1];
			if (currentTime < nextPrayerTimestamp) {
				console.log('current timestamp: ',currentTime);
				console.log('prayer timestamp: ',nextPrayerTimestamp);
				cIndex = index
				pIndex = index-1
				break
			}
		}
		let midtime = new Date().setHours(0,0,0)
				if ((cIndex === 6 || cIndex === 0) && currentTime >= midtime) {
					console.log("its past midnight");
					let prevMidnight = currentDayPrayerDataArray[7]
					if (currentTime <= prevMidnight) {
						console.log("Time is between midnight and islamic midnight");
						nextPrayerTimestamp = currentDayPrayerDataArray[cIndex]
						prevPrayerTimestamp = prevMidnight
						pIndex = 6
					}

				}
		// console.log('outside prayer timestamp: ', nextPrayerTimestamp);
	
		$("#first-prayer").text(waqts[pIndex])
	
		// console.log('current waqt: ',currentDayPrayerData[nextPrayerTimestamp]);

		//calculating the final time in ms
		let timeLeftInMs = nextPrayerTimestamp - currentTime

		// getting the final hour and minutes
		let hoursDifference = Math.floor(timeLeftInMs / 1000 / 60 / 60)
		let minutesDifference = Math.floor(timeLeftInMs / 1000 / 60) - hoursDifference * 60

		// Displaying the time left
		$("#time-left").text(`${hoursDifference}h${minutesDifference}m`)
		$("#second-prayer").text(`left until ${waqts[cIndex]}`)
		// remove splash screen and show the app
		// $("#splash-screen").css("display", "none")
		// $("#app-container").css("display", "flex")
		setTimeout(updateTime, 1000)
	})()
	
}
