import { getCoords, getArrayedDate } from "./utils/geo"
import prayerConfig from "./prayer-config"
import AppData from "./model/app-settings"
import updateView, { hideSplashScreen } from "./view/updateView"

// init current date & timezone
// these change if it is a new day or device is in a different timezone
let currentDate = getArrayedDate(new Date())
let currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

// splash screen showing before the device is ready
document.addEventListener(
	"deviceready",
	async function () {
		// calculate prayer times
		calculateTimes(currentDate)

		// populate main app with data before unhiding the splash screen
		await updateView()

		// asynchronously start checking if its a new day or timezone:
		initNewDayOrTimezoneHandler()

		// hide splash screen
		hideSplashScreen()
	},
	false
)

function initNewDayOrTimezoneHandler() {
	// every second, recalculate prayer times if it is a new day or timezone
	setInterval(() => {
		const date = new Date()
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
		// if its new day:
		if (date.getDate() != currentDate.getDate()) {
			// update current date
			currentDate = date
			// recalculate prayer times
			calculateTimes(date)
			updateView()
		}
		// if its new timezone:
		if (timezone != currentTimeZone) {
			// update current timezone
			currentTimeZone = timezone
			// update coordinates
			AppData.coords = getCoords()
			// recalculate prayer times
			calculateTimes(date)
			updateView()
		}
	}, 1000)
}

// calculate prayer times
const calculateTimes = (date) => {
	AppData.prayerTimes = prayerConfig.getTimes(date, AppData.coords, "auto", "auto", AppData.settings.timeFormat)
}
