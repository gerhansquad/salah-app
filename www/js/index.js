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
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	try {
		navigator.geolocation.getCurrentPosition(onSuccess, onError);
		// onSuccess("test");
	} catch (error) {
		// $("#first-prayer").text("TRY CATCH ERROR:", error);
		console.log(error);
		// log(error);
	}
}

// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
function onSuccess(position) {
	const AdhanAPIParams = {
		latitude: "51.508515",
		longitude: "-0.1254872",
		method: "2",
		month: "4",
		year: "2017",
	};

	cordova.plugin.http.get(
		"http://api.aladhan.com/v1/calendar",
		AdhanAPIParams,
		{ Authorization: "OAuth2: token" },
		function (response) {
			console.log(response.data);
			// log(response.data);
		},
		function (response) {
			// $("#first-prayer").text("GET FAIL:", response.error);
			console.log(response.error);
			// log(response.error);
		}
	);
}

// onError Callback receives a PositionError object
function onError(error) {
	// $("#first-prayer").text("GEOLOCATION FAIL:", error.message);
	console.log(error.message);
	// log(error.message);
}

function log(error) {
	cordova.plugin.http.setServerTrustMode(
		"nocheck",
		function () {
			sendError();
		},
		function () {
			$("#first-prayer").text("CANT IGNORE SSL");
		}
	);

	var caller_line = new Error().stack.split("\n")[4];
	var index = caller_line.indexOf("at ");
	var clean = caller_line.slice(index + 2, caller_line.length);

	// console.log(clean.match("js:.*:")[0].substr(3, 1) - 1);

	let sendError = function () {
		cordova.plugin.http.post(
			"https://10.0.2.2/log",
			{
				error: error + "\n\tat" + clean + "\n",
			},
			{
				Authorization: "OAuth2: token",
			},
			function (response) {
				$("#first-prayer").text(response.status);
			},
			function (response) {
				$("#time-left").css("display", "none");
				$("#second-prayer").css("display", "none");
				$("#first-prayer").text(response.error);
			}
		);
	};
}
