export function getArrayedDate(date) {
	return [date.getFullYear(), date.getMonth(), date.getDate()]
}

// returns [lats, longs]
export function getCoords() {
	let coords = []
	navigator.geolocation.getCurrentPosition(
		function (position) {
			// Get postion data and store in geodata
			coords[0] = position.coords.latitudes
			coords[1] = position.coords.longitude
			console.log(`ONSUCCESS GET CURRENT POSITION: ${position.coords.latitude}, ${position.coords.longitude}`)
		},
		function (error) {
			throw new Error(`ONERROR GET CURRENT POSITION: ${error.code} - ${error.message}`)
		},
		{ timeout: 2000 }
	)
	return coords
}

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

//---------------------- Degree-Based Math Class -----------------------

export let DMath = {
	dtr: function (d) {
		return (d * Math.PI) / 180.0
	},
	rtd: function (r) {
		return (r * 180.0) / Math.PI
	},

	sin: function (d) {
		return Math.sin(this.dtr(d))
	},
	cos: function (d) {
		return Math.cos(this.dtr(d))
	},
	tan: function (d) {
		return Math.tan(this.dtr(d))
	},

	arcsin: function (d) {
		return this.rtd(Math.asin(d))
	},
	arccos: function (d) {
		return this.rtd(Math.acos(d))
	},
	arctan: function (d) {
		return this.rtd(Math.atan(d))
	},

	arccot: function (x) {
		return this.rtd(Math.atan(1 / x))
	},
	arctan2: function (y, x) {
		return this.rtd(Math.atan2(y, x))
	},

	fixAngle: function (a) {
		return this.fix(a, 360)
	},
	fixHour: function (a) {
		return this.fix(a, 24)
	},

	fix: function (a, b) {
		a = a - b * Math.floor(a / b)
		return a < 0 ? a + b : a
	},
}