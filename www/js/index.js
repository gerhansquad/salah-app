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

let fileObj
let salah_times 
let saved_month

let salahExists // Global existence var
let monthExists // Global existence var

let system_month

function setFileObj(isWriting, fname){
	if(isWriting){
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 100000, function (fs) {
			fs.root.getFile(fname, { create: true, exclusive: false }, function (fileEntry) {
				fileObj = fileEntry
				console.log(`set fileObj to ${fileObj.name} while writing`)
			})
		}, function(error){
			console.log("WRITE ERROR:",error)
		})
	} else {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getFile(fname, { create: false }, function (fileEntry) {
				fileObj = fileEntry
				console.log(`set fileObj to ${fileObj.name} while reading`)
			})
		},function(error){
			console.log("READ ERROR:",error)
		})
	}
}

function writeFile(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...")
			// readFile(fileEntry)
        }

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString())
        }

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'application/json' })
        }

        fileWriter.write(dataObj)
    })
}

function createFile(data, fname){
	setFileObj(true, fname)
	writeFile(fileObj,{month:system_month})
}

function setJSON(fileEntry) {
	fileEntry.file(function (file) {
		var reader = new FileReader()

		reader.onloadend = function() {
			// let times = JSON.parse(this.result)
			console.log("Successful file read: " + this.result)
			if(fileEntry.name == "saved-month.json"){
				saved_month = (JSON.parse(this.result).month)
			} else if (fileEntry.name == "salah-time.json"){
				salah_times = JSON.parse(this.result)
			}
			console.log(fileEntry.name,"succesfully set global var")
			// displayFileData(fileEntry.fullPath + ": " + this.result)
			
		}
		reader.readAsText(file)

	}, function(error){
		console.log(error)
	})
}

function checkIfSalahFileExists(){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
		// reading the filesystem to see if fname exists
		fileSystem.root.getFile("salah-times.json", { create: false }, fileExists, function(){
			salahExists = false
			console.log("Successfully set salahExists");
		})
	}, getFSFail) // of requestFileSystem
}

function checkIfMonthFileExists(){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
		// reading the filesystem to see if fname exists
		fileSystem.root.getFile("saved-month.json", { create: false }, fileExists, function(){
			monthExists = false
			console.log("Successfully set monthExists");
		})
	}, getFSFail) // of requestFileSystem
}

function fileExists(fileEntry){
	console.log("File " + fileEntry.fullPath + " exists!")
	if(fileEntry.name == "salah-times.json"){
		salah_times_exist = true
	} else if (fileEntry.name == "saved-month.json") {
		saved_month_exist = true
	}
}

function getFSFail(evt) {
	console.log(evt.target.error.code)
}


document.addEventListener("deviceready", onDeviceReady, false)

function onDeviceReady() {
	system_month = new Date().getMonth()+1
	checkIfMonthFileExists()
	checkIfSalahFileExists()
	// navigator.geolocation.getCurrentPosition(onSuccess, onError)
	onSuccess("test")
}

// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
function onSuccess(position) {
	const AdhanAPIParams = {
		latitude: "51.508515",
		longitude: "-0.1254872",
		method: "2"
	}

	// create file "saved-month"
	if(!monthExists) {
		createFile(system_month,"saved-month.json")
	} else {
		// window.window.saved_month exists, but we still want to read it
		setFileObj(false, "saved-month.json") // sets fileObj to "saved-month.json"
		setJSON(fileObj) // sets window.window.saved_month global variable
	}

	if(saved_month != system_month || salahExists ){
		// this is a new month OR no prayer info saved prior
		cordova.plugin.http.get(
			"https://api.aladhan.com/v1/calendar",
			AdhanAPIParams,
			{ Authorization: "OAuth2: token" },
			function (response) {
				createFile(response.data,"salah-times.json")
				createFile(system_month,"saved-month.json")
			},
			function (response) {
				console.log(response.error)
			}
		)
	} else {
		// still the same month
		// Parse json and display the timings
		setFileObj(false, "salah-times.json")
		setJSON(fileObj)

		console.log(salah_times.data.length)
		for (var i = 0; i<salah_times.data.length; i++) {
			console.log(salah_times.data[i].timings.Fajr)
		}
		
	}
}

// onError Callback receives a PositionError object
function onError(error) {
	console.log(error.message)
}
