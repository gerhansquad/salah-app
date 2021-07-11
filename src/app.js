import loadPrayerData from "./model/dataLoader"
import updateView from "./view/updateView"

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

		// document.getElementById('app-container').innerText = 'lolololols'
		setInterval(() => {
			console.log(JSON.stringify(salahObj,null,4),JSON.stringify(monthObj,null,4))
			// document.getElementById('app-container').innerText = `salah: ${JSON.stringify(salahObj,null,4)}\nmonth: ${JSON.stringify(monthObj,null,4)}`
			updateView(salahObj)
		},500)
	},
	false
);