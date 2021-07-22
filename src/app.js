import loadPrayerData from "./model/dataLoader"
import updateView from "./view/updateView"
import State from "./model/SalahData"

document.addEventListener(
	"deviceready",
	function () {
		const state = new State()
		// let salahObj = null
		// let monthObj = null

		// this runs asynchronously
		loadPrayerData(state).then(() => {updateView(state)}) //temporary
		
	}, 
	false
)
