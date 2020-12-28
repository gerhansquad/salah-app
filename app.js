import { initPrayerModel } from "./PrayerWindow/model";
import { initPrayerView } from "./PrayerWindow/processing";

document.addEventListener(
	"deviceready",
	function () {
		// update the file system
		initPrayerModel();
		// update the frontend
		setTimeout(initPrayerView, 100);
	},
	false
);
