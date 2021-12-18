//--------------------- Copyright Block ----------------------
/* 

PrayTimes.js: Prayer Times Calculator (ver 2.3)
Copyright (C) 2007-2011 PrayTimes.org

Developer: Hamid Zarrabi-Zadeh
License: GNU LGPL v3.0

TERMS OF USE:
	Permission is granted to use this code, with or 
	without modification, in any website or application 
	provided that credit is given to the original work 
	with a link back to PrayTimes.org.

This program is distributed in the hope that it will 
be useful, but WITHOUT ANY WARRANTY. 

PLEASE DO NOT REMOVE THIS COPYRIGHT BLOCK.
 
*/ 


//--------------------- Help and Manual ----------------------
/*

User's Manual: 
http://praytimes.org/manual

Calculation Formulas: 
http://praytimes.org/calculation



//------------------------ User Interface -------------------------


	getTimes (date, coordinates [, timeZone [, dst [, timeFormat]]]) 
	
	setMethod (method)       // set calculation method 
	adjust (parameters)      // adjust calculation parameters	
	tune (offsets)           // tune times by given offsets 

	getMethod ()             // get calculation method 
	getSetting ()            // get current calculation parameters
	getOffsets ()            // get current time offsets


//------------------------- Sample Usage --------------------------


	let PT = new PrayTimes('ISNA');
	let times = PT.getTimes(new Date(), [43, -80], -5);
	document.write('Sunrise = '+ times.sunrise)


*/

//---------------------- Degree-Based Math Class -----------------------


let DMath = {

	dtr: function(d) { return (d * Math.PI) / 180.0; },
	rtd: function(r) { return (r * 180.0) / Math.PI; },

	sin: function(d) { return Math.sin(this.dtr(d)); },
	cos: function(d) { return Math.cos(this.dtr(d)); },
	tan: function(d) { return Math.tan(this.dtr(d)); },

	arcsin: function(d) { return this.rtd(Math.asin(d)); },
	arccos: function(d) { return this.rtd(Math.acos(d)); },
	arctan: function(d) { return this.rtd(Math.atan(d)); },

	arccot: function(x) { return this.rtd(Math.atan(1/x)); },
	arctan2: function(y, x) { return this.rtd(Math.atan2(y, x)); },

	fixAngle: function(a) { return this.fix(a, 360); },
	fixHour:  function(a) { return this.fix(a, 24 ); },

	fix: function(a, b) { 
		a = a- b* (Math.floor(a/ b));
		return (a < 0) ? a+ b : a;
	}
}
	
//------------------------ Constants --------------------------
	
	// Time Names
	let timeNames = {
		imsak    : 'Imsak',
		fajr     : 'Fajr',
		sunrise  : 'Sunrise',
		dhuhr    : 'Dhuhr',
		asr      : 'Asr',
		sunset   : 'Sunset',
		maghrib  : 'Maghrib',
		isha     : 'Isha',
		midnight : 'Midnight'
	}


	// Calculation Methods
	let methods = {
		MWL: {
			name: 'Muslim World League',
			params: { fajr: 18, isha: 17 } },
		ISNA: {
			name: 'Islamic Society of North America (ISNA)',
			params: { fajr: 15, isha: 15 } },
		Egypt: {
			name: 'Egyptian General Authority of Survey',
			params: { fajr: 19.5, isha: 17.5 } },
		Makkah: {
			name: 'Umm Al-Qura University, Makkah',
			params: { fajr: 18.5, isha: '90 min' } },  // fajr was 19 degrees before 1430 hijri
		Karachi: {
			name: 'University of Islamic Sciences, Karachi',
			params: { fajr: 18, isha: 18 } },
		Tehran: {
			name: 'Institute of Geophysics, University of Tehran',
			params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'Jafari' } },  // isha is not explicitly specified in this method
		Jafari: {
			name: 'Shia Ithna-Ashari, Leva Institute, Qum',
			params: { fajr: 16, isha: 14, maghrib: 4, midnight: 'Jafari' } }
	}


	// Default Parameters in Calculation Methods
	let defaultParams = {
		maghrib: '0 min', midnight: 'Standard'

	}
 
 
	//----------------------- Parameter Values ----------------------
	/*
	
	// Asr Juristic Methods
	asrJuristics = [ 
		'Standard',    // Shafi`i, Maliki, Ja`fari, Hanbali
		'Hanafi'       // Hanafi
	],


	// Midnight Mode
	midnightMethods = [ 
		'Standard',    // Mid Sunset to Sunrise
		'Jafari'       // Mid Sunset to Fajr
	],


	// Adjust Methods for Higher Latitudes
	highLatMethods = [
		'NightMiddle', // middle of night
		'AngleBased',  // angle/60th of night
		'OneSeventh',  // 1/7th of night
		'None'         // No adjustment
	],


	// Time Formats
	timeFormats = [
		'24h',         // 24-hour format
		'12h',         // 12-hour format
		'12hNS',       // 12-hour format with no suffix
		'Float'        // floating point number 
	],
	*/	


	//---------------------- Default Settings --------------------
	
	let calcMethod = 'MWL'

	// do not change anything here; use adjust method instead
	let setting = {  
		imsak    : '10 min',
		dhuhr    : '0 min',  
		asr      : 'Standard',
		highLats : 'NightMiddle'
	}

	let timeFormat = '24h'
	let timeSuffixes = ['am', 'pm']
	let invalidTime =  '-----'

	let numIterations = 1
	let offset = {}


	//----------------------- Local Variables ---------------------

	let lat, lng, elv, timeZone, jDate
	

	//---------------------- Initialization -----------------------
	
	
	// set methods defaults
	let defParams = defaultParams;
	for (let i in methods) {
		let params = methods[i].params;
		for (let j in defParams)
			if ((typeof(params[j]) == 'undefined'))
				params[j] = defParams[j];
	};

	// initialize settings
	// calcMethod = methods[method] ? method : calcMethod;
	let params = methods[calcMethod].params;
	for (let id in params)
		setting[id] = params[id];

	// init time offsets
	for (let i in timeNames)
		offset[i] = 0;




		//---------------------- Misc Functions -----------------------

	// convert given string into a number
	function eval(str) {
		return 1* (str+ '').split(/[^0-9.+-]/)[0];
	}


	// detect if input contains 'min'
	function isMin(arg) {
		return (arg+ '').indexOf('min') != -1;
	}


	// compute the difference between two times 
	function timeDiff(time1, time2) {
		return DMath.fixHour(time2- time1);
	}


	// add a leading 0 if necessary
	function twoDigitsFormat(num) {
		return (num <10) ? '0'+ num : num;
	}
	





		
	
	//----------------------- Public Functions ------------------------

	
	// set calculation method 
	function setMethod(method) {
		if (methods[method]) {
			adjust(methods[method].params);
			calcMethod = method;
		}
	}


	// set calculating parameters
	function adjust(params) {
		for (let id in params)
			setting[id] = params[id];
	}


	// set time offsets
	function tune(timeOffsets) {
		for (let i in timeOffsets)
			offset[i] = timeOffsets[i];
	}

	// get current calculation method
	function getMethod() { return calcMethod; }

	// get current setting
	function getSetting() { return setting; }

	// get current time offsets
	function getOffsets() { return offset; }

	// get default calc parametrs
	function getDefaults() { return methods; }


	// return prayer times for a given date
	function getTimes(date, coords, timezone, dst, format) {
		lat = 1* coords[0];
		lng = 1* coords[1]; 
		elv = coords[2] ? 1* coords[2] : 0;
		timeFormat = format || timeFormat;
		if (date.constructor === Date)
			date = [date.getFullYear(), date.getMonth()+ 1, date.getDate()];
		if (typeof(timezone) == 'undefined' || timezone == 'auto')
			timezone = getTimeZone(date);
		if (typeof(dst) == 'undefined' || dst == 'auto') 
			dst = getDst(date);
		timeZone = 1* timezone+ (1* dst ? 1 : 0);
		jDate = julian(date[0], date[1], date[2])- lng/ (15* 24);
		
		return computeTimes(date);
	}


	// convert float time to the given format (see timeFormats)
	function getFormattedTime(time, format, suffixes) {
		if (isNaN(time))
			return invalidTime;
		if (format == 'Float') return time;
		suffixes = suffixes || timeSuffixes;

		time = DMath.fixHour(time+ 0.5/ 60);  // add 0.5 minutes to round
		let hours = Math.floor(time); 
		let minutes = Math.floor((time- hours)* 60);
		let suffix = (format == '12h') ? suffixes[hours < 12 ? 0 : 1] : '';
		let hour = (format == '24h') ? twoDigitsFormat(hours) : ((hours+ 12 -1)% 12+ 1);
		return hour+ ':'+ twoDigitsFormat(minutes)+ (suffix ? ' '+ suffix : '');
	}


	//---------------------- Calculation Functions -----------------------


	// compute mid-day time
	function midDay(time) {
		let eqt = sunPosition(jDate+ time).equation;
		let noon = DMath.fixHour(12- eqt);
		return noon;
	}


	// compute the time at which sun reaches a specific angle below horizon
	function sunAngleTime(angle, time, direction) {
		let decl = sunPosition(jDate+ time).declination;
		let noon = midDay(time);
		let t = 1/15* DMath.arccos((-DMath.sin(angle)- DMath.sin(decl)* DMath.sin(lat))/ 
				(DMath.cos(decl)* DMath.cos(lat)));
		return noon+ (direction == 'ccw' ? -t : t);
	}


	// compute asr time 
	function asrTime(factor, time) { 
		let decl = sunPosition(jDate+ time).declination;
		let angle = -DMath.arccot(factor+ DMath.tan(Math.abs(lat- decl)));
		return sunAngleTime(angle, time);
	}


	// compute declination angle of sun and equation of time
	// Ref: http://aa.usno.navy.mil/faq/docs/SunApprox.php
	function sunPosition(jd) {
		let D = jd - 2451545.0;
		let g = DMath.fixAngle(357.529 + 0.98560028* D);
		let q = DMath.fixAngle(280.459 + 0.98564736* D);
		let L = DMath.fixAngle(q + 1.915* DMath.sin(g) + 0.020* DMath.sin(2*g));

		let R = 1.00014 - 0.01671* DMath.cos(g) - 0.00014* DMath.cos(2*g);
		let e = 23.439 - 0.00000036* D;

		let RA = DMath.arctan2(DMath.cos(e)* DMath.sin(L), DMath.cos(L))/ 15;
		let eqt = q/15 - DMath.fixHour(RA);
		let decl = DMath.arcsin(DMath.sin(e)* DMath.sin(L));

		return {declination: decl, equation: eqt};
	}


	// convert Gregorian date to Julian day
	// Ref: Astronomical Algorithms by Jean Meeus
	function julian(year, month, day) {
		if (month <= 2) {
			year -= 1;
			month += 12;
		};
		let A = Math.floor(year/ 100);
		let B = 2- A+ Math.floor(A/ 4);

		let JD = Math.floor(365.25* (year+ 4716))+ Math.floor(30.6001* (month+ 1))+ day+ B- 1524.5;
		return JD;
	}

	
	//---------------------- Compute Prayer Times -----------------------


	// compute prayer times at given julian date
	function computePrayerTimes(times) {
		times = dayPortion(times);
		let params  = setting;
		
		let imsak   = sunAngleTime(eval(params.imsak), times.imsak, 'ccw');
		let fajr    = sunAngleTime(eval(params.fajr), times.fajr, 'ccw');
		let sunrise = sunAngleTime(riseSetAngle(), times.sunrise, 'ccw');  
		let dhuhr   = midDay(times.dhuhr);
		let asr     = asrTime(asrFactor(params.asr), times.asr);
		let sunset  = sunAngleTime(riseSetAngle(), times.sunset);
		let maghrib = sunAngleTime(eval(params.maghrib), times.maghrib);
		let isha    = sunAngleTime(eval(params.isha), times.isha);

		return {
			imsak: imsak, fajr: fajr, sunrise: sunrise, dhuhr: dhuhr, 
			asr: asr, sunset: sunset, maghrib: maghrib, isha: isha
		};
	}


	// compute prayer times 
	function computeTimes(date) {
		// default times
		let times = { 
			imsak: 5, fajr: 5, sunrise: 6, dhuhr: 12, 
			asr: 13, sunset: 18, maghrib: 18, isha: 18
		};

		// main iterations
		for (let i=1 ; i<=numIterations ; i++) 
			times = computePrayerTimes(times);

		times = adjustTimes(times);
		
		// add midnight time
		times.midnight = (setting.midnight == 'Jafari') ? 
				times.sunset+ timeDiff(times.sunset, times.fajr)/ 2 :
				times.sunset+ timeDiff(times.sunset, times.sunrise)/ 2;

		times = tuneTimes(times);
		return modifyFormats(times, date);
	}

	// adjust times 
	function adjustTimes(times) {
		let params = setting;
		for (let i in times)
			times[i] += timeZone- lng/ 15;
			
		if (params.highLats != 'None')
			times = adjustHighLats(times);
			
		if (isMin(params.imsak))
			times.imsak = times.fajr- eval(params.imsak)/ 60;
		if (isMin(params.maghrib))
			times.maghrib = times.sunset+ eval(params.maghrib)/ 60;
		if (isMin(params.isha))
			times.isha = times.maghrib+ eval(params.isha)/ 60;
		times.dhuhr += eval(params.dhuhr)/ 60; 

		return times;
	}


	// get asr shadow factor
	function asrFactor(asrParam) {
		let factor = {Standard: 1, Hanafi: 2}[asrParam];
		return factor || eval(asrParam);
	}


	// return sun angle for sunset/sunrise
	function riseSetAngle() {
		//let earthRad = 6371009; // in meters
		//let angle = DMath.arccos(earthRad/(earthRad+ elv));
		let angle = 0.0347* Math.sqrt(elv); // an approximation
		return 0.833+ angle;
	}


	// apply offsets to the times
	function tuneTimes(times) {
		for (let i in times)
			times[i] += offset[i]/ 60; 
		return times;
	}


	// convert times to given time format
	function modifyFormats(times, date) {
		for (let i in times)
			times[i] = getFormattedTime(times[i], timeFormat); 
		return {date, times};
	}


	// adjust times for locations in higher latitudes
	function adjustHighLats(times) {
		let params = setting;
		let nightTime = timeDiff(times.sunset, times.sunrise); 

		times.imsak = adjustHLTime(times.imsak, times.sunrise, eval(params.imsak), nightTime, 'ccw');
		times.fajr  = adjustHLTime(times.fajr, times.sunrise, eval(params.fajr), nightTime, 'ccw');
		times.isha  = adjustHLTime(times.isha, times.sunset, eval(params.isha), nightTime);
		times.maghrib = adjustHLTime(times.maghrib, times.sunset, eval(params.maghrib), nightTime);
		
		return times;
	}
	
	// adjust a time for higher latitudes
	function adjustHLTime(time, base, angle, night, direction) {
		let portion = nightPortion(angle, night);
		let timeDifference = (direction == 'ccw') ? 
			timeDiff(time, base):
			timeDiff(base, time);
		if (isNaN(time) || timeDifference > portion) 
			time = base+ (direction == 'ccw' ? -portion : portion);
		return time;
	}

	
	// the night portion used for adjusting times in higher latitudes
	function nightPortion(angle, night) {
		let method = setting.highLats;
		let portion = 1/2 // MidNight
		if (method == 'AngleBased')
			portion = 1/60* angle;
		if (method == 'OneSeventh')
			portion = 1/7;
		return portion* night;
	}


	// convert hours to day portions 
	function dayPortion(times) {
		for (let i in times)
			times[i] /= 24;
		return times;
	}


	//---------------------- Time Zone Functions -----------------------


	// get local time zone
	function getTimeZone(date) {
		let year = date[0];
		let t1 = gmtOffset([year, 0, 1]);
		let t2 = gmtOffset([year, 6, 1]);
		return Math.min(t1, t2);
	}

	
	// get daylight saving for a given date
	function getDst(date) {
		return 1* (gmtOffset(date) != getTimeZone(date));
	}


	// GMT offset for a given date
	function gmtOffset(date) {
		let localDate = new Date(date[0], date[1]- 1, date[2], 12, 0, 0, 0);
		let GMTString = localDate.toGMTString();
		let GMTDate = new Date(GMTString.substring(0, GMTString.lastIndexOf(' ')- 1));
		let hoursDiff = (localDate- GMTDate) / (1000* 60* 60);
		return hoursDiff;
	}

	


//---------------------- Init Object -----------------------

// let t = calcTimes().getTimes(new Date(2021, 0, 1), [12.971599, 77.594566], 'auto', 'auto', '12h')
// console.log(); 
console.log(getTimes(new Date(2021, 11, 32), [12.971599, 77.594566], 'auto', 'auto', '24h'))
// console.log(calcMethod);
// setMethod("ISNA")
// console.log(calcMethod);
// console.log(getTimes(new Date(2021, 0, 1), [12.971599, 77.594566], 'auto', 'auto', '24h'))
