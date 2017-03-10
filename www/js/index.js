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
var url = "http://qrcode.innovatewebdesign.nl/api.php";

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function showLoggedIn(response) {
	document.getElementById("content").innerHTML = "Hallo " + response["firstname"] + " " + response["lastname"] + "<br /><br /><button id=\"startScan\">Remote login</button><br /><br /><button id=\"logout\">Logout</button>";
	document.getElementById("logout").onclick = function () {	logOut();	};
	
	var resultDiv;
	document.addEventListener("deviceready", init, false);

	function init() {
		document.querySelector("#startScan").addEventListener("touchend", startScan, false);
		resultDiv = document.querySelector("#results");
	}
	
	function startScan() {
		cordova.plugins.barcodeScanner.scan(
			function (result) {
				if (result.format !== "" && result.format !== "QR_CODE"){
					alert("Scanning failed: Scan is not a QR Code");
				} else if (result.format !== "") {
					var userid = window.localStorage.getItem("userid");
					var token = window.localStorage.getItem("token");
					var httpQRLogin = new XMLHttpRequest();
					var paramsQRLogin = "userid=" + userid + "&token=" + token + "&clientid=" + result.text;
					httpQRLogin.open("POST", url, true);

					//Send the proper header information along with the request
					httpQRLogin.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					httpQRLogin.onreadystatechange = function() {
						if(httpQRLogin.readyState == 4 && httpQRLogin.status == 200) {
							if(httpQRLogin.responseText === 1) {
								alert("You'll be logged in a matter of seconds.");
							}
						}
					};
					httpQRLogin.send(paramsQRLogin);
				}
			},
			function (error) {
				alert("Scanning failed: " + error);
			}
		);
		
	}
}

function showLoginForm() {
	document.getElementById("content").innerHTML = "<input type=\"text\" id=\"username\" /><br /><input type=\"password\" id=\"password\" /><br /><input type=\"button\" id=\"submit\" value=\"Login\" />";
	document.getElementById("submit").onclick = function () {
		var username = document.getElementById("username").value;
		var password = document.getElementById("password").value;
		var http = new XMLHttpRequest();
		var params = "username=" + username + "&password=" + password;
		http.open("POST", url, true);
		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		
		http.onreadystatechange = function() {
			if(http.readyState == 4 && http.status == 200) {
				var textContent = http.responseText;
				http.abort();
				http = null;
				var response = JSON.parse(textContent);

				if (response["username"] == username) {
					window.localStorage.setItem("loggedIn", 1);
					window.localStorage.setItem("userid", response["userid"]);
					window.localStorage.setItem("token", response["token"]);
					showLoggedIn(response);
				} else {
					alert("Wrong password");
				}
			}
		};
		http.send(params);
	}
}

function logOut() {	
	var userid = window.localStorage.getItem("userid");
	var token = window.localStorage.getItem("token");
	window.localStorage.removeItem("loggedIn");
	window.localStorage.removeItem("userid");
	window.localStorage.removeItem("token");
	var http = new XMLHttpRequest();
	var params = "userid=" + userid + "&token=" + token + "&action=logout";
	
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			http.abort();
			http = null;
			
			showLoginForm();
		} else {
			showLoginForm();
		}
	};
	http.send(params);
}

if (window.localStorage.getItem("loggedIn") == 1) {
	var userid = window.localStorage.getItem("userid");
	var token = window.localStorage.getItem("token");
	var http = new XMLHttpRequest();
	var params = "userid=" + userid + "&token=" + token;
	
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var textContent = http.responseText;
			http.abort();
			http = null;
			var response = JSON.parse(textContent);
			
			if (response !== false) {
				showLoggedIn(response);
			} else {
				showLoginForm();
			}
		} else {
			showLoginForm();
		}
	};
	http.send(params);
} else {
	showLoginForm();
}

