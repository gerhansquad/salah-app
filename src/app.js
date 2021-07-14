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
		loadPrayerData(state)

		// .then(({ salah, month }) => {
		// 	salahObj = salah
		// 	monthObj = month
		// })

		// updating the view every second
		setInterval(() => {
			updateView(state)
		}, 1000)
	},
	false
)
