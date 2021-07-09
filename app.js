import { loadPrayerData } from "./PrayerWindow/model"
import { initPrayerView } from "./PrayerWindow/processing"

document.addEventListener(
	"deviceready",
	function () {
		// update the file system
		let file = null
		loadPrayerData().then((f) => {file = f});
		// update the frontend after a delay to let I/O complete
		// setTimeout(initPrayerView,500);
		initPrayerView(file)
	},
	false
);