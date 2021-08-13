// This is just for testing, will be implemented later
const testData = require ("../shared/test.json")


Date.prototype.toJSON = function(){ return this.toLocaleString(); } //This is so we can view dates in logs properly 

function makeTimestamp(time, yearNo, monthNo, dayNo) {
	let date = new Date()
    date.setFullYear(yearNo)
    date.setDate(dayNo)
    date.setMonth(parseInt(monthNo)-1)
	let hour = time.split(":")[0]
	hour = hour == 0 ? 24 : hour
	date.setHours(hour)
	date.setMinutes(time.split(":")[1])
	date.setSeconds(0)
	return date
}

function processDate(data) {
    let yearData = []
    const apiYear = parseInt(data[1][0].date.gregorian.year);
    const currentYear = new Date().getFullYear()
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
                    // console.log(JSON.stringify(currentDayPrayerDataArray[i]));
                }
                i++
            }
            // console.log(dayNo+1, JSON.stringify(currentDayPrayerDataArray));
            return currentDayPrayerDataArray;
        })
        yearData.push(monthData) 
    }
    let currentDate = new Date()
    let firstPrayer
    let lastPrayer
    let currentDayPrayerData = []
    currentDayPrayerData = yearData[currentDate.getMonth()][currentDate.getDate()-1]
  

   
    if (currentDate.getDate() === 1) {
        //if month and day is first: first prayer = prev year's isha & last prayer is next day's fajr
        if (currentDate.getMonth() === 0) {
            //firstPrayer = state.salah.apiData.lastPrayerTimestamp
            lastPrayer = yearData[currentDate.getMonth()][currentDate.getDate()][0]
                
        } else { //else if first day of month:  first prayer = prev months last ishaa & last prayer = next days fajr
            firstPrayer = yearData[currentDate.getMonth()-1][new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()][4]
            lastPrayer = yearData[currentDate.getMonth()][currentDate.getDate()][0]
        }
        
    }
    else if (currentDate.getDate() === new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate()) {
        //  else if last day and month: first prayer = prev days isha & last prayer = next years first fajr
        if (currentDate.getMonth === 11) {
            firstPrayer = yearData[currentDate.getMonth()][currentDate.getDate()-2][4]
            // lastPrayer = state.salah.apiData.nextYear[0][0][0]
        } else { //  else if last day of month: first prayer = prev days isha & last prayer = next month's first fajr
            firstPrayer = yearData[currentDate.getMonth()][currentDate.getDate()-2][4]
            lastPrayer = yearData[currentDate.getMonth()+1][0][0]
        } 
    }
    
    else { // first prayer = prev days isha & last prayer = next day's fajr
        firstPrayer = yearData[currentDate.getMonth()][currentDate.getDate()-2][4]
        lastPrayer = yearData[currentDate.getMonth()][currentDate.getDate()][0]
    }

    currentDayPrayerData = [firstPrayer, ...currentDayPrayerData, lastPrayer]
    console.log(JSON.stringify(currentDayPrayerData));
}
// This is to mimic the api data (for testing)
processDate(testData)
