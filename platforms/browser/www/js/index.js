// Functions
// Fix for viewport changes
function hideCopyright() {
	document.getElementsByClassName("form")[0].classList.remove("error");
	document.getElementsByClassName("footer")[0].classList.add("hide");
}

function showCopyright() {
	document.getElementsByClassName("footer")[0].classList.remove("hide");
}

// Shake if wrong login
function shake() {
	var loginUsername = document.getElementById('username');
	var loginPassword = document.getElementById('password');
	var userIcon = document.getElementsByClassName('user')[0];
	var lockIcon = document.getElementsByClassName('lock')[0];
	loginUsername.classList.add("shake-horizontal");
	loginPassword.classList.add("shake-horizontal");
	loginUsername.classList.add("shake-constant");
	loginPassword.classList.add("shake-constant");
	userIcon.classList.add("shake-horizontal");
	lockIcon.classList.add("shake-horizontal");
	userIcon.classList.add("shake-constant");
	lockIcon.classList.add("shake-constant");
	window.setTimeout(function () {
		loginUsername.classList.remove("shake-horizontal");
		loginPassword.classList.remove("shake-horizontal");
		loginUsername.classList.remove("shake-constant");
		loginPassword.classList.remove("shake-constant");
		userIcon.classList.remove("shake-horizontal");
		lockIcon.classList.remove("shake-horizontal");
		userIcon.classList.remove("shake-constant");
		lockIcon.classList.remove("shake-constant");
	}, 400);
}

// Shake Animation Fixes
function shakeFix(delay) {
	var loginUsername = document.getElementById('username');
	var loginPassword = document.getElementById('password');
	var userIcon = document.getElementsByClassName('user')[0];
	var lockIcon = document.getElementsByClassName('lock')[0];

	setTimeout(function(){
		loginUsername.classList.add("loaded");
		loginPassword.classList.add("loaded");
		userIcon.classList.add("loaded");
		lockIcon.classList.add("loaded");
	}, delay);
}

// Shake if wrong login
function shakeForgot() {
	var loginUsername = document.getElementById('username');
	var userIcon = document.getElementsByClassName('user')[0];
	loginUsername.classList.add("shake-horizontal");
	loginUsername.classList.add("shake-constant");
	userIcon.classList.add("shake-horizontal");
	userIcon.classList.add("shake-constant");
	window.setTimeout(function () {
		loginUsername.classList.remove("shake-horizontal");
		loginUsername.classList.remove("shake-constant");
		userIcon.classList.remove("shake-horizontal");
		userIcon.classList.remove("shake-constant");
	}, 400);
}

// Shake Animation Fixes
function shakeFixForgot(delay) {
	var loginUsername = document.getElementById('username');
	var userIcon = document.getElementsByClassName('user')[0];

	setTimeout(function(){
		loginUsername.classList.add("loaded");
		userIcon.classList.add("loaded");
	}, delay);
}

// When App starts
// API URL
var url = "http://www.team16j.p004.nl/mobileClient";

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

// Logs the user out
function logOut() {	
	document.getElementById("content").classList.add("login");
	var userId = window.localStorage.getItem("userId");
	var token = window.localStorage.getItem("token");
	window.localStorage.removeItem("loggedIn");
	window.localStorage.removeItem("userId");
	window.localStorage.removeItem("token");
	var http = new XMLHttpRequest();
	var params = "userId=" + userId + "&token=" + token + "&action=logout";
	
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			http.abort();
			http = null;
			
			showLogin();
			shakeFix(1500);
		} else {
			showLogin();
			shakeFix(1500);
		}
	};
	http.send(params);
}

// Logs the user in
function login() {
	document.getElementById("submit").onclick = function () {
		var loginForm = document.getElementsByClassName("form")[0];
		loginForm.classList.remove("error");
		loginForm.classList.add("submitted");
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

				if (response["userId"] !== null) {
					window.localStorage.setItem("loggedIn", 1);
					window.localStorage.setItem("userId", response["userId"]);
					window.localStorage.setItem("token", response["token"]);
					showDashboard(response);
				} else {
					loginForm.classList.add("error");
					shake();
				}
			} else {
				shake();
				loginForm.classList.add("error");
			}
		};
		http.send(params);
	};
}

// Page Login
function showLogin() {
	document.getElementById("content").innerHTML = "<div class=\"rectangle\"></div><form class=\"form\" onsubmit=\"return document.loginForm.user.value != '' && document.loginForm.pass.value != ''\"><img src=\"img/logo.png\" class=\"logo\" ><input type=\"text\" id=\"username\" data-dependency=\"first\" name=\"username\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"user\" src=\"img/user_icon.png\"><br /><input type=\"password\" name=\"password\" id=\"password\" data-dependency=\"second\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"lock\" src=\"img/lock_icon.png\"><br /><input type=\"button\" id=\"submit\" value=\"Sign In\" /><br><a href=\"#\" onclick=\"showForgotPassword();\">Forgot Password?</a></form>";
	login();
}

function showLoginFromPassword() {
	var form = document.getElementsByClassName("form")[0];
	form.classList.add("aniOut");
	var rectangle = document.getElementsByClassName("rectangle")[0];
	rectangle.classList.add("notSmall");
	rectangle.classList.remove("small");
	window.setTimeout(function () {
		form.classList.remove("aniOut");
		form.innerHTML = "<img src=\"img/logo.png\" class=\"logo\" ><input type=\"text\" id=\"username\" data-dependency=\"first\" name=\"username\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"user\" src=\"img/user_icon.png\"><br /><input type=\"password\" name=\"password\" id=\"password\" data-dependency=\"second\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"lock\" src=\"img/lock_icon.png\"><br /><input type=\"button\" id=\"submit\" value=\"Sign In\" /><br><a href=\"#\" onclick=\"showForgotPassword();\">Forgot Password?</a>";
		form.classList.remove("forgotPassword");
		form.classList.remove("submitted");
		shakeFix(1500);
		login();
	}, 800);
}

// Page Forgot Password
function showForgotPassword() {
	var form = document.getElementsByClassName("form")[0];
	form.classList.add("aniOut");
	var rectangle = document.getElementsByClassName("rectangle")[0];
	rectangle.classList.add("small");
	rectangle.classList.remove("notSmall");
	window.setTimeout(function () {
		form.classList.remove("aniOut");
		form.innerHTML = "<h2>Reset Password</h2><input type=\"text\" id=\"username\" data-dependency=\"first\" name=\"username\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"user\" src=\"img/user_icon.png\"><br /><input type=\"button\" id=\"submit\" value=\"Reset\" /><br><a href=\"#\" onclick=\"showLoginFromPassword();\"><- Go back to login</a>";
		form.classList.add("forgotPassword");
		form.classList.remove("submitted");
		shakeFixForgot(1500);
		document.getElementById("submit").onclick = function () {
			form.classList.remove("error");
			form.classList.add("submitted");
			var username = document.getElementById("username").value;
			var http = new XMLHttpRequest();
			var params = "username=" + username + "&action=resetPass";
			http.open("POST", url, true);
			//Send the proper header information along with the request
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

			http.onreadystatechange = function() {
				if (http.readyState == 4 && http.status == 200) {
					var textContent = http.responseText;
					http.abort();
					http = null;
					showLoginFromPassword();
				} else if (http.readyState == 4) {
					shakeForgot();
					form.classList.add("error");
				}
			};
			http.send(params);
		};
	}, 800);
}

// Page Dashboard
function showDashboard(response) {
	document.getElementById("content").classList.remove("login");
	document.getElementById("content").innerHTML = "<div class=\"square1\"></div><div class=\"square2\"></div><div class=\"square3\"></div><div class=\"square4\"></div><div class=\"square5\"></div><img src=\"img/menu.png\" class=\"dashmenu\"><div class=\"dashbutton\" id=\"startScan\"></div><img src=\"img/vhoek.png\" class=\"dashvhoek\"><br /><button id=\"logout\" class=\"dashlogout\">Logout</button>";	
	//Zorgt ervoor dat de gebruiker kan uitloggen wanneer hij op de knop klikt
	document.getElementById("logout").onclick = function () { logOut(); };
	
	window.localStorage.setItem("checkLogin", setInterval(function () { checklogin(); }, 2000));
	
	// Scan QR functions
	document.addEventListener("deviceready", init, false);

	function init() {
		document.querySelector("#startScan").addEventListener("touchend", startScan, false);
	}
	
	function startScan() {
		var onSuccess = function (s) {
			alert(1);
			var userId = window.localStorage.getItem("userId");
			var token = window.localStorage.getItem("token");
			var httpQRLogin = new XMLHttpRequest();
			var result = JSON.parse(s);
			if (result.type == "login") {
				var paramsQRLogin = "userId=" + userId + "&token=" + token + "&clientId=" + result.value;
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
		};
		
		var onFailure = function (s) {
			alert("Scanning failed: " + s);
		};
		
		var params = {
			text_title: "Scan een QR-Code", // Android only
			text_instructions: "Richt op QR-Code", // Android only
			camera: "back", // defaults to "back"
			flash: "off", // defaults to "auto". See Quirks
			drawSight: true
		};
				
		window.QRScanner.prepare(onDone); // show the prompt 
 
		function onDone(err, status){
		  if (err) {
		   // here we can handle errors and clean up any loose ends. 
		   console.error(err);
		  }
		  if (status.authorized) {
			// W00t, you have camera access and the scanner is initialized. 
			// QRscanner.show() should feel very fast. 
		  } else if (status.denied) {
		   // The video preview will remain black, and scanning is disabled. We can 
		   // try to ask the user to change their mind, but we'll have to send them 
		   // to their device settings with `QRScanner.openSettings()`. 
		  } else {
			// we didn't get permission, but we didn't get permanently denied. (On 
			// Android, a denial isn't permanent unless the user checks the "Don't 
			// ask again" box.) We can ask again at the next relevant opportunity. 
		  }
		}
		
		function displayContents(err, text){
		  if(err){
			// an error occurred, or the scan was canceled (error code `6`) 
		  } else {
			// The scan completed, display the contents of the QR code: 
			alert(text);
		  }
		}
		
		window.QRScanner.scan(displayContents);

		// Make the webview transparent so the video preview is visible behind it. 
		window.QRScanner.show();
	}
}

// Check login
function checklogin (first = false) {
	if (window.localStorage.getItem("loggedIn") == 1) {
		var userId = window.localStorage.getItem("userId");
		var token = window.localStorage.getItem("token");
		var http = new XMLHttpRequest();
		var params = "userId=" + userId + "&token=" + token;

		http.open("POST", url, true);
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() {
			if(http.readyState == 4 && http.status == 200) {
				var textContent = http.responseText;
				http.abort();
				http = null;
				var response = JSON.parse(textContent);

				// If API gives response
				if (response !== false && first !== false) {
					showDashboard(response);
				} else if (response == false) {
					logOut();
					clearInterval(window.localStorage.getItem("checkLogin"));
				}
			} else if (http.readyState == 4) {
				logOut();
				clearInterval(window.localStorage.getItem("checkLogin"));
			}
		};
		http.send(params);
	} else {
		logOut();
		clearInterval(window.localStorage.getItem("checkLogin"));
	}
}

checklogin(true);

