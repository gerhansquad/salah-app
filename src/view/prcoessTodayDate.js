
Date.prototype.toJSON = function(){ return this.toLocaleString(); } //This is so we can view dates in logs properly 
function processTodayDate (state, time) {
    let data = state.salah.apiData.currentYear
    let firstPrayer = null
    let lastPrayer = null
    let currentDayPrayerData = []
    currentDayPrayerDataArray = {}
    currentDayPrayerData = data[time.getMonth()][time.getDate()-1]
  
    if (time.getDate() === 1) {
        //if month and day is first: first prayer = prev year's isha & last prayer is next day's fajr
        if (time.getMonth() === 0) {
            firstPrayer = state.salah.apiData.lastPrayerTimestamp
            lastPrayer = data[time.getMonth()][time.getDate()][0]
            console.log("First Day And First Month");
                
        } else { //else if first day of month:  first prayer = prev months last ishaa & last prayer = next days fajr
            firstPrayer = data[time.getMonth()-1][new Date(time.getFullYear(), time.getMonth(), 0).getDate()-1][4]
            lastPrayer = data[time.getMonth()][time.getDate()][0]
            console.log("First Day of month");
        }
        
    }
    else if (time.getDate() === new Date(time.getFullYear(), time.getMonth()+1, 0).getDate()) {
        //  else if last day and month: first prayer = prev days isha & last prayer = next years first fajr
        if (time.getMonth() === 11) {
            firstPrayer = data[time.getMonth()][time.getDate()-2][4]
            lastPrayer = state.salah.apiData.nextYear[0][0][0]
            console.log("Last day and last month");
        } else { //  else if last day of month: first prayer = prev days isha & last prayer = next month's first fajr
            firstPrayer = data[time.getMonth()][time.getDate()-2][4]
            lastPrayer = data[time.getMonth()+1][0][0]
            console.log("Last Day of month");
        } 
    }
    
    else { // first prayer = prev days isha & last prayer = next day's fajr
        firstPrayer = data[time.getMonth()][time.getDate()-2][4]
        lastPrayer = data[time.getMonth()][time.getDate()][0]
        console.log("Day and Month not last or first");
    }

    currentDayPrayerData = [firstPrayer, ...currentDayPrayerData, lastPrayer]
    console.log(JSON.stringify(currentDayPrayerData));
    const waqts = ["PrevIsha", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "NextFajr"]
    waqts.map((waqt, index) => {
        currentDayPrayerDataArray[waqt] = currentDayPrayerData[index]
	})
    console.log(JSON.stringify(currentDayPrayerDataArray));
    return currentDayPrayerDataArray;

}