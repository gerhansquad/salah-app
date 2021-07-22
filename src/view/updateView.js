import processTodaysDate from "./processTodaysDate"

export default function updateView(state) {
	let newDay = new Date()
	newDay.setHours(0,0,0)
	let currentDayPrayerDataArray = null
	let currentDayPrayerData = {}
	const waqts = ['Fajr','Dhuhr','Asr','Maghrib','Isha','PrevIsha', 'NextFajr']
	function getNewDayData() {
		currentDayPrayerDataArray = processTodaysDate(state.salah.apiData)
		console.log("GOT TODAYS DATA " , JSON.stringify(currentDayPrayerDataArray, null, 4)) 
		
		
		waqts.map((waqt, index) => {
			let timestamp = currentDayPrayerDataArray[index]
			currentDayPrayerData[waqt] = timestamp
			console.log("Adding " + JSON.stringify(currentDayPrayerData, null , 4));
		})
	
			
		console.log("NEW WAQT OBJ : " + JSON.stringify(currentDayPrayerData, null, 4));
	}

	(function updateTime() {
		let currentTime = new Date()
		if (currentDayPrayerDataArray === null || currentTime === newDay) {
			console.log("currentDayPrayerDataArray is null or its a new day");
			getNewDayData()
		}
		let nIndex = null
		let pIndex = null
		let prevPrayerTimestamp = null
		let nextPrayerTimestamp = null
		if (currentTime > currentDayPrayerDataArray[4]) { // time has passed isha prayertime -> prev prayer is prevday's isha
			nextPrayerTimestamp = currentDayPrayerDataArray[6];
			prevPrayerTimestamp = currentDayPrayerDataArray[4];
			nIndex = 0
			pIndex = 4
		}
		else {
			for (let index = 0; index < currentDayPrayerDataArray.length-2; index++) {
				if (currentTime < currentDayPrayerDataArray[index]) {
					if (index === 0) { //if its the first prayer -> prev prayer is prevday's isha
						nextPrayerTimestamp = currentDayPrayerDataArray[index];
						prevPrayerTimestamp = currentDayPrayerDataArray[5];
						nIndex = index
						pIndex = 4
					}
					else { //leave as it is
						nextPrayerTimestamp = currentDayPrayerDataArray[index];
						prevPrayerTimestamp = currentDayPrayerDataArray[index-1];
						nIndex = index
						pIndex = index-1
					}
					break
				} 
			}
		}


		console.log('prev prayer timestamp: ', prevPrayerTimestamp);
		console.log('current timestamp: ', currentTime);
		console.log('next prayer timestamp: ', nextPrayerTimestamp);
		
		$("#first-prayer").text(waqts[pIndex])
	
		// console.log('current waqt: ',currentDayPrayerData[nextPrayerTimestamp]);

		//calculating the final time in ms
		let timeLeftInMs = nextPrayerTimestamp - currentTime

		// getting the final hour and minutes
		let hoursDifference = Math.floor(timeLeftInMs / 1000 / 60 / 60)
		let minutesDifference = Math.floor(timeLeftInMs / 1000 / 60) - hoursDifference * 60

		// Displaying the time left
		$("#time-left").text(`${hoursDifference}h${minutesDifference}m`)
		$("#second-prayer").text(`left until ${waqts[nIndex]}`)
		// remove splash screen and show the app
		// $("#splash-screen").css("display", "none")
		// $("#app-container").css("display", "flex")
		setTimeout(updateTime, 1000)
	})()
	
}
