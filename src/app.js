import loadPrayerData from "./model/dataLoader"
import updateView from "./view/updateView"

document.addEventListener(
	"deviceready",
	function () {
		loadPrayerData().then(updateView)
	}, 
	false
)
