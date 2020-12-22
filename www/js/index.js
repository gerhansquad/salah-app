/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
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
document.addEventListener("deviceready", onDeviceReady, false)

function onDeviceReady() {
	// Cordova is now initialized. Have fun!
	navigator.geolocation.getCurrentPosition(onSuccess, onError)
}

// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
//
let onSuccess = function (position) {

	const otherAPIParams = {
		user_ip: "5.30.161.11",
		country: "AE",
		zipcode: "00000"
	}

	const AdhanAPIParams = {
		latitude:"51.508515",
		longitude:"-0.1254872",
		method:"2",
		month:"4",
		year:"2017"
	}

	cordova.plugin.http.get('https://api.aladhan.com/v1/calendar',
	AdhanAPIParams,
	{ Authorization: 'OAuth2: token' }, function(response) {
		// stuff = JSON.parse(response.data);
		// console.log(stuff.message);
  		$("#row1").text(response.data)
	}, function(response) {
  		$("#row2").text(response.error)
	});
}


// onError Callback receives a PositionError object
//
function onError(error) {
	alert("code: " + error.code + "\n" + "message: " + error.message + "\n")
}
