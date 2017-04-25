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

function hideCopyright() {
	document.getElementsByClassName("form")[0].classList.remove("error");
	document.getElementsByClassName("footer")[0].classList.add("hide");
}

function showCopyright() {
	document.getElementsByClassName("footer")[0].classList.remove("hide");
}

function shake() {
	document.getElementById('username').classList.add("shake-horizontal");
	document.getElementById('password').classList.add("shake-horizontal");
	document.getElementById('username').classList.add("shake-constant");
	document.getElementById('password').classList.add("shake-constant");
	document.getElementsByClassName('user')[0].classList.add("shake-horizontal");
	document.getElementsByClassName('lock')[0].classList.add("shake-horizontal");
	document.getElementsByClassName('user')[0].classList.add("shake-constant");
	document.getElementsByClassName('lock')[0].classList.add("shake-constant");
	window.setTimeout(function () {
		document.getElementById('username').classList.remove("shake-horizontal");
		document.getElementById('password').classList.remove("shake-horizontal");
		document.getElementById('username').classList.remove("shake-constant");
		document.getElementById('password').classList.remove("shake-constant");
		document.getElementsByClassName('user')[0].classList.remove("shake-horizontal");
		document.getElementsByClassName('lock')[0].classList.remove("shake-horizontal");
		document.getElementsByClassName('user')[0].classList.remove("shake-constant");
		document.getElementsByClassName('lock')[0].classList.remove("shake-constant");
	}, 400);
}

// API URL
var url = "http://qrcode.innovatewebdesign.nl/api.php";

// Default APP Booting sequence
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


// Shows the pages with restricted access in the division with the id content.

// Dit krijg je te zien nadat je bent ingelogd
function showLoggedIn(response) {
	document.getElementById("content").innerHTML = "Hallo " + response["firstname"] + " " + response["lastname"] + "<br /><br /><button id=\"startScan\">Remote login</button><br /><br /><button id=\"logout\">Logout</button>";
	
	//Zorgt ervoor dat de gebruiker kan uitloggen wanneer hij op de knop klikt
	document.getElementById("logout").onclick = function () {logOut();};
	
	// Scan QR functions
	var resultDiv;
	document.addEventListener("deviceready", init, false);

	function init() {
		document.querySelector("#startScan").addEventListener("touchend", startScan, false);
		resultDiv = document.querySelector("#results");
	}
	
	function startScan() {
		cordova.plugins.barcodeScanner.scan(
			function (result) {
				// Check the barcode type
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
							if(httpQRLogin.responseText == 1) {
								alert("You'll be logged in within a matter of seconds.");
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

// Shows login form
function showLoginForm() {
	document.getElementById("content").innerHTML = "<div class=\"rectangle\"></div><form class=\"form\" onsubmit=\"return document.loginForm.user.value != '' && document.loginForm.pass.value != ''\"><img src=\"img/logo.png\" class=\"logo\" ><input type=\"email\" id=\"username\" data-dependency=\"first\" name=\"username\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"user\" src=\"img/user_icon.png\"><br /><input type=\"password\" name=\"password\" id=\"password\" data-dependency=\"second\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"lock\" src=\"img/lock_icon.png\"><br /><input type=\"button\" id=\"submit\" value=\"Sign In\" /><br><a href=\"https://www.google.nl\">Forgot Password?</a>";
	document.getElementById("submit").onclick = function () {
		document.getElementsByClassName("form")[0].classList.remove("error");
		document.getElementsByClassName("form")[0].classList.add("submitted");
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
					document.getElementsByClassName("form")[0].classList.add("error");
					shake();
					alert("Wrong password");
				}
			} else {
				shake();
				document.getElementsByClassName("form")[0].classList.add("error");
			}
		};
		http.send(params);
	}
}

// Logs the user out
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

// Check login
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
			
			// If API gives response
			if (response !== false) {
				showLoggedIn(response);
			} else {
				window.localStorage.removeItem("loggedIn");
				window.localStorage.removeItem("userid");
				window.localStorage.removeItem("token");
				showLoginForm();
			}
		} else {
			window.localStorage.removeItem("loggedIn");
			window.localStorage.removeItem("userid");
			window.localStorage.removeItem("token");
			showLoginForm();
		}
	};
	http.send(params);
} else {
	showLoginForm();
}

function NoClickDelay(el) {
	this.element = typeof el == 'object' ? el : document.getElementById(el);
	if( window.Touch ) this.element.addEventListener('touchstart', this, false);
}

NoClickDelay.prototype = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'touchstart': this.onTouchStart(e); break;
			case 'touchmove': this.onTouchMove(e); break;
			case 'touchend': this.onTouchEnd(e); break;
		}
	},

	onTouchStart: function(e) {
		e.preventDefault();
		this.moved = false;

		this.theTarget = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
		if(this.theTarget.nodeType == 3) this.theTarget = theTarget.parentNode;
		this.theTarget.className+= ' pressed';

		this.element.addEventListener('touchmove', this, false);
		this.element.addEventListener('touchend', this, false);
	},

	onTouchMove: function(e) {
		this.moved = true;
		this.theTarget.className = this.theTarget.className.replace(/ ?pressed/gi, '');
	},

	onTouchEnd: function(e) {
		this.element.removeEventListener('touchmove', this, false);
		this.element.removeEventListener('touchend', this, false);

		if( !this.moved && this.theTarget ) {
			this.theTarget.className = this.theTarget.className.replace(/ ?pressed/gi, '');
			var theEvent = document.createEvent('MouseEvents');
			theEvent.initEvent('click', true, true);
			this.theTarget.dispatchEvent(theEvent);
		}

		this.theTarget = undefined;
	}
};

window.onload = function () {
	if (event.keyCode == 13) {
         document.getElementById("submit").click();
    }
	
	setTimeout(function(){
		document.getElementById('username').classList.add("loaded");
		document.getElementById('password').classList.add("loaded");
		document.getElementsByClassName('user')[0].classList.add("loaded");
		document.getElementsByClassName('lock')[0].classList.add("loaded");
	}, 1500);
};