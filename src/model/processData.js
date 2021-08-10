// This is just for testing, will be implemented later
const testData = require ("../shared/test.json")


Date.prototype.toJSON = function(){ return this.toLocaleString(); } //This is so we can view dates in logs properly 

function makeTimestamp(time, monthNo, dayNo) {
	let date = new Date()
    date.setDate(dayNo)
    date.setMonth(parseInt(monthNo)-1)
	let hour = time.split(":")[0]
	hour = hour == 0 ? 24 : hour
	date.setHours(hour)
	date.setMinutes(time.split(":")[1])
	date.setSeconds(0)
	return date
}
// current and next
// state.salah.apiData.current = processDate(current)
// state.salah.apiData.next = processDate(next)
function processDate(data) {
    let yearData = []
    for (const month in data) {
        const monthData = data[month].map((time, dayNo) => {
            let times = time.timings // {"Fajr":"06:04 (PST)","Sunrise":"07:22 (PST)","Dhuhr":"12:10 (PST)",...}
            delete times["Sunset"]
            delete times["Imsak"]
            delete times["Midnight"]
            delete times["Sunrise"]
            let i = 0
            let currentDayPrayerDataArray = []
            for (const waqt in times) {
                let time = times[waqt].match("[0-9][0-9]:[0-9][0-9]")[0]
                currentDayPrayerDataArray[i] = makeTimestamp(time, month, dayNo+1)
                if (waqt === "Isha" && dayNo === data[month].length-1 && month === "12") {
                    console.log(JSON.stringify(currentDayPrayerDataArray[i]));
                }
                i++
            }
            // console.log(dayNo+1, JSON.stringify(currentDayPrayerDataArray));
            return currentDayPrayerDataArray;
        })
        yearData.push(monthData) 
    }

    // console.table(yearData)

    // for (let month in yearData) {
    //     console.log(JSON.stringify(yearData[month]));
    // }
    // Getting today's timings
	// let currentDate = new Date()
    // let n = currentDate.getDate()
    // console.log(`\nToday's Timings : ${JSON.stringify(yearData[n-1])}`)

}

// This is to mimic the api data (for testing)
processDate(testData)