/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License") you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

var system_month; // to store the current month

var geodata = {}; // to store the location data

var timezone; //This gets us the users current timezone, so we could check it against the api's timezone.
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------FILE SECTION------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
function writeFile(fileEntry, dataObj) {
	// Create a FileWriter object for our FileEntry (log.txt).
	fileEntry.createWriter(function (fileWriter) {
		fileWriter.onwriteend = function () {
			console.log("Successful file write...");
			// readFile(fileEntry)
		};

		fileWriter.onerror = function (e) {
			console.log("Failed file write: " + e.toString());
		};

		// If data object is not passed in,
		// create a new Blob instead.
		if (!dataObj) {
			dataObj = new Blob(["some file data"], { type: "application/json" });
		}

		fileWriter.write(dataObj);
	});
}

// This function creates fileEntry obj and calls writeFile()
function createwriteFile(data, fname) {
	window.requestFileSystem(
		LocalFileSystem.PERSISTENT,
		100000,
		function (fs) {
			fs.root.getFile(fname, { create: true, exclusive: false }, function (fileEntry) {
				if (fname.localeCompare("saved-month.json") == 0) {
					console.log("Writing file saved-month");
					writeFile(fileEntry, { month: system_month });
				} else {
					console.log("Writing file salah-times");
					writeFile(fileEntry, data);
				}
			});
		},
		function (error) {
			console.log("WRITE ERROR:", error);
		}
	);
}

// this method gets checks for the month and if the times don't need changing, it will do what we want to with salah data via funcs
function displayData(fileEntry, fdata) {
	let data = JSON.parse(fdata);
	if (fileEntry.name.localeCompare("saved-month.json") == 0) {
		console.log("Displaying saved month: " + data.month);
		console.log(system_month);
		if (system_month != data.month) {
			console.log("month is diff, making api req");
			reqAPI();
		}
	} else {
		// Here do whatever we need to with the stored salah data (display/call funstion/etc)
		try {
			/**
			 * Adding each day's prayer data as a value to a hashmap with the day (1-31) as the key
			 * for faster retrieval and deletion
			 */

			//This is here to check the users timezone. (It's here because in the one up we are only reading the file Saved-month.)
			console.log("System's Current Timezone: " + timezone);
			console.log("Api's Timezones: " + data.data[0].meta.timezone);

			if (timezone == data.data[0].meta.timezone) {
				let currentMonthPrayerData = {};
				for (var i = 0; i < data.data.length; i++) {
					currentMonthPrayerData[`${i}`] = data.data[i].timings;
				}
				// Getting today's day (1-31)
				let currentDate = new Date();
				let currentDay = currentDate.getDate();
				// let currentHour = currentDate.getHours();
				// let currentMinute = currentDate.getMinutes();

				// Saving today's prayer data to a variable
				let currentDayPrayerData = currentMonthPrayerData[`${currentDay}`]; // {"Fajr":"06:04 (PST)","Sunrise":"07:22 (PST)","Dhuhr":"12:10 (PST)",...}

				// Deleting Sunset as it is the same value as Maghrib
				delete currentDayPrayerData["Sunset"];

				// Deleting Imsak as it didn't come sorted into the right position
				delete currentDayPrayerData["Imsak"];

				/**
				 * Pushing each Waqt's prayer time (already sorted) to an array so that
				 * we can determine when in the timeline the system time falls
				 */
				let currentDayPrayerDataArray = [];
				for (const waqt in currentDayPrayerData) {
					currentDayPrayerDataArray.push(currentDayPrayerData[waqt]);
				}
				insertDateSorted(currentDayPrayerDataArray, currentDate);
				updatePrayerNames(currentDate, currentDayPrayerData, currentDayPrayerDataArray);
			} else {
				console.log("timezone is diff, making api req");
				reqAPI();
			}
		} catch (error) {
			console.error(`displayData error: ${error}`);
		}
	}
}

function makeTimestamp(time) {
	let date = new Date();
	let hour = time.split(":")[0];
	hour = hour == 0 ? 24 : hour;
	date.setHours(hour);
	date.setMinutes(time.split(":")[1]);
	date.setSeconds(0);
	return date;
}

// Inserts a date into a sorted list of dates in the right position
function insertDateSorted(arr, key) {
	try {
		for (let i = 0; i < arr.length; i++) {
			let time = arr[i].match("[0-9][0-9]:[0-9][0-9]")[0];
			arr[i] = makeTimestamp(time);
		}

		let i = arr.length - 1;
		while (i >= 0 && arr[i] > key) {
			arr[i + 1] = arr[i];
			i -= 1;
		}
		arr[i + 1] = key;
	} catch (error) {
		console.error(`insertDateSorted error: ${error}`);
	}
}

function updatePrayerNames(currentTimestamp, currentDayPrayerData, arr) {
	try {
		let prayerIndex = arr.indexOf(currentTimestamp);

		let currentPrayerIndex = prayerIndex == 0 ? arr.length - 1 : prayerIndex - 1;
		let currentPrayerTime = arr[currentPrayerIndex];

		let nextPrayerIndex = prayerIndex == arr.length - 1 ? 0 : prayerIndex + 1;
		let nextPrayerTime = arr[nextPrayerIndex];

		for (const waqt in currentDayPrayerData) {
			currentDayPrayerData[`${waqt}`] = makeTimestamp(currentDayPrayerData[waqt].match("[0-9][0-9]:[0-9][0-9]")[0]);
			// console.log(`${waqt}: ${currentDayPrayerData[`${waqt}`]}`)
		}

		$("#first-prayer").text(getKeyByValue(currentDayPrayerData, currentPrayerTime));
		$("#second-prayer").text(`left until ${getKeyByValue(currentDayPrayerData, nextPrayerTime)}`);

		let difference = nextPrayerTime - currentTimestamp;
		let hoursDifference = Math.floor(difference / 1000 / 60 / 60);
		difference -= hoursDifference * 1000 * 60 * 60;
		let minutesDifference = Math.floor(difference / 1000 / 60);
		$("#time-left").text(`${hoursDifference}h${minutesDifference}m`);

		function getKeyByValue(object, value) {
			return Object.keys(object).find((key) => object[key] == `${value}`);
		}
	} catch (error) {
		console.error(`updatePrayerNames error: ${error}`);
	}
}

// This function reads the file data and calls displayData()
function getFileData(fileEntry) {
	fileEntry.file(
		function (file) {
			var reader = new FileReader();
			reader.onloadend = function () {
				console.log("Successful file read: " + this.result);
				displayData(fileEntry, this.result);
			};

			reader.readAsText(file);
		},
		function () {
			console.log("File Read Error");
		}
	);
}

// This function gets fileWrite obj for reading and calls getFileData()
function readFile(fname) {
	window.requestFileSystem(
		LocalFileSystem.PERSISTENT,
		0,
		function (fs) {
			fs.root.getFile(fname, { create: false, exclusive: false }, function (fileEntry) {
				if (fname.localeCompare("saved-month.json") == 0) {
					console.log("Reading saved-month.json");
					getFileData(fileEntry);
				} else {
					console.log("Reading salah-times.json");
					getFileData(fileEntry);
				}
			});
		},
		function (error) {
			console.log("READ ERROR:", error);
		}
	);
}

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------API SECTION------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
function reqAPI() {
	const AdhanAPIParams = {
		// latitude: `${geodata.latitude}`,
		// longitude: `${geodata.longitude}`,
		latitude: 25.2048, // dubai geodata
		longitude: 55.2708, // dubai geodata
		method: "2",
	};
	// this is a new month OR no prayer info saved prior
	cordova.plugin.http.get(
		"https://api.aladhan.com/v1/calendar",
		AdhanAPIParams,
		{ Authorization: "OAuth2: token" },
		function (response) {
			createwriteFile(response.data, "salah-times.json");
			createwriteFile(system_month, "saved-month.json");
		},
		function (response) {
			console.log(`API CALL ERROR: ${response.error}`);
		}
	);
}

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------CHECK FILE EXISTS SECTION-----------------------------------
// ------------------------------------------------------------------------------------------------------------

function checkIfSalahFileExists() {
	window.requestFileSystem(
		LocalFileSystem.PERSISTENT,
		0,
		function (fileSystem) {
			fileSystem.root.getFile("salah-times.json", { create: false }, fileExists, fileDoesNotExist);
		},
		getFSFail
	);

	function fileExists(fileEntry) {
		console.log("File " + fileEntry.fullPath + " exists!");
	}
	function fileDoesNotExist() {
		console.log("salah file doesn't exist, make api call, calling reqAPI()");
		reqAPI(); //If salah file doesn't exist, make API req
	}
	function getFSFail(evt) {
		console.log(evt.target.error.code);
	}
}

function checkIfMonthFileExists() {
	window.requestFileSystem(
		LocalFileSystem.PERSISTENT,
		0,
		function (fileSystem) {
			fileSystem.root.getFile("saved-month.json", { create: false }, fileExists, fileDoesNotExist);
		},
		getFSFail
	);

	function fileExists(fileEntry) {
		console.log("File " + fileEntry.fullPath + " exists!");
	}
	function fileDoesNotExist() {
		console.log("month file doesn't exist, creating month file by calling createwrite()");
		createwriteFile(system_month, "saved-month.json");
	}
	function getFSFail(evt) {
		console.log(evt.target.error.code);
	}
}

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------MAIN SECTION------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
document.addEventListener("deviceready", onDeviceReady, false);

export function onDeviceReady() {
	// console.log = function () {};
	system_month = new Date().getMonth() + 1;
	timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
function onSuccess(position) {
	// Get postion data and store in geodata
	geodata.latitude = position.coords.latitude;
	geodata.longitude = position.coords.longitude;
	// checkIfSalahFileExists
	checkIfSalahFileExists();
	// checkIfMonthFileExists
	checkIfMonthFileExists();

	// now read both files
	var delayInMilliseconds = 4000;
	setTimeout(function () {
		readFile("saved-month.json");
	}, delayInMilliseconds);

	setTimeout(function () {
		readFile("salah-times.json");
	}, delayInMilliseconds);
}

// onError Callback receives a PositionError object
function onError(error) {
	console.log(error.message);
}
