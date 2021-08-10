export default class SalahData {
	constructor() {
		this.salah = {
			filename: "salah-data.json",
			file: null,
			apiData: {currentYear: null, nextYear: null, lastPrayerTimestamp: null},
			settings: {apiParams: {latitude: null, longitude: null, method: "null", school: "null"}, autoDetect: true}
		}
	}
}
