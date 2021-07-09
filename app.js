import { loadPrayerData } from "./PrayerWindow/model"
import { updatePrayerView } from "./PrayerWindow/processing"

document.addEventListener(
	"deviceready",
	function () {

		let salahObj = null
		let monthObj = null

		// setInterval(() => {
		// 	console.log('BOOM 5 SECONDS')
		// }, 5000);

		loadPrayerData().then(({salah,month}) => {
			salahObj = salah
			monthObj = month
		});

		
		// setInterval(() => {
		// 	console.log(JSON.stringify(salahObj,null,4),JSON.stringify(monthObj,null,4))
		// 	// if (salahObj.data) updatePrayerView(salahObj.data); return
		// 	// updatePrayerView(null)
		// },10000)
	},
	false
);