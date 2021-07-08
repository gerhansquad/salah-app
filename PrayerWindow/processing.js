import { startUpdating } from "./view"
import { makeTimestamp, genericErrorHandler } from "../utils/utility"
let val = null;


export function initPrayerView() {
	let fname = "salah-times.json"
	window.requestFileSystem(
		LocalFileSystem.PERSISTENT,
		0,
		function (fs) {
			fs.root.getFile(fname, { create: false, exclusive: false }, function (fileEntry) {
				fileEntry.file(
					function (file) {
						val = true;
						console.log(`VALUE FROM INSIDE CALLBACK : ${val}`);

						var reader = new FileReader()
						reader.onloadend = function () {
							console.log("Successful file read: " + this.result)
							let data = JSON.parse(this.result)
							processData(data)
						}
						reader.readAsText(file)
					},
					function (error) {
						genericErrorHandler(error)
					}
				)
			})
		},
		function (error) {
			genericErrorHandler(error)
		}
	)
	setTimeout(() => console.log(`VALUE FROM OUTSIDE CALLBACK IS ${val}`),5000);
}

export function processData(data) {
	let currentMonthPrayerData = {}
	for (var i = 0; i < data.data.length; i++) {
		currentMonthPrayerData[`${i}`] = data.data[i].timings
	}
	// Getting today's day (1-31)
	let currentDate = new Date()
	let currentDay = currentDate.getDate()

	// Saving today's prayer data to a variable
	let currentDayPrayerData = currentMonthPrayerData[`${currentDay}`] // {"Fajr":"06:04 (PST)","Sunrise":"07:22 (PST)","Dhuhr":"12:10 (PST)",...}

	// Deleting Sunset as it is the same value as Maghrib
	delete currentDayPrayerData["Sunset"]

	// Deleting Imsak as it didn't come sorted into the right position
	delete currentDayPrayerData["Imsak"]

	/**
	 * Pushing each Waqt's prayer time (already sorted) to an array so that
	 * we can determine when in the timeline the system time falls
	 */
	let currentDayPrayerDataArray = []
	for (const waqt in currentDayPrayerData) {
		currentDayPrayerDataArray.push(currentDayPrayerData[waqt])
	}
	insertDateSorted(currentDayPrayerDataArray, currentDate)
	startUpdating(currentDate, currentDayPrayerData, currentDayPrayerDataArray)
}

// Inserts a date into a sorted list of dates in the right position
function insertDateSorted(arr, key) {
	try {
		for (let i = 0; i < arr.length; i++) {
			let time = arr[i].match("[0-9][0-9]:[0-9][0-9]")[0]
			arr[i] = makeTimestamp(time)
		}

		let i = arr.length - 1
		while (i >= 0 && arr[i] > key) {
			arr[i + 1] = arr[i]
			i -= 1
		}
		arr[i + 1] = key
	} catch (error) {
		genericErrorHandler(error)
	}
}
