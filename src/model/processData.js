import { makeTimestamp } from "../utils/utility"
export { processData }
function processData(data, state) {
    let yearData = []
    const apiYear = parseInt(data[1][0].date.gregorian.year);
    const currentYear = new Date().getFullYear()
    currentYear === apiYear && (() => {state.salah.apiData.timeZone = data[1][0].meta.timezone; state.salah.apiData.apiYear = apiYear;})()
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
                currentDayPrayerDataArray[i] = makeTimestamp(time, apiYear, month, dayNo+1)
                if (currentYear === apiYear && waqt === "Isha" && dayNo === data[month].length-1 && month === "12") {
                    console.log(JSON.stringify(currentDayPrayerDataArray[i]));
                    state.salah.apiData.lastPrayerTimestamp = currentDayPrayerDataArray[i];
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