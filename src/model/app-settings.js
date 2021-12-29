import prayerConfig from "../prayer-config"
import { getCoords } from "../utils/general"
// model for the app to be used by frontend
export default {
	coords: getCoords(),
	prayerTimes: {},
	settings: {
		timeFormat: prayerConfig.getTimeFormat(),
		method: prayerConfig.getCalcMethod(),
		notifToggle: true,
		setMethod: function (m) {
			this.settings.method = m
		},
		setTimeFormat: function (f) {
			this.settings.timeFormat = f
		},
		setNotifToggle: function (bool) {
			this.settings.notifToggle = bool
		},
	},
}
