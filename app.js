import { initPrayerModel } from "./PrayerWindow/model"
import { initPrayerView } from "./PrayerWindow/processing"

document.addEventListener(
	"deviceready",
	function () {
		// update the file system
		initPrayerModel()
		// update the frontend after a delay to let I/O complete
		setTimeout(initPrayerView, 50)
		// initPrayerView()
	},
	false
);