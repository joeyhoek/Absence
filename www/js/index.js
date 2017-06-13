/*jshint esversion: 6 */
/*jshint strict:false */
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
		if(http.readyState === 4 && http.status === 200) {
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
			if(http.readyState === 4 && http.status === 200) {
				var textContent = http.responseText;
				http.abort();
				http = null;
				var response = JSON.parse(textContent);

				if (response.userId !== null) {
					window.localStorage.setItem("loggedIn", 1);
					window.localStorage.setItem("userId", response.userId);
					window.localStorage.setItem("token", response.token);
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
	document.getElementById("content").innerHTML = "<header class=\"cd-header\"><a class=\"cd-primary-nav-trigger\" href='#'><span class=\"cd-menu-icon\"></span></a></header><nav><ul class=\"cd-primary-nav\"><div class='menuCenter'><li class=\"cd-label\"><a href=\"#\"><i class=\"fa fa-tachometer\" aria-hidden=\"true\"></i><figcaption>Dashboard</figcaption></a></li><div class=\"profile\"><li class=\"cd-label\"><a href=\"#\"><i class=\"fa fa-user\" aria-hidden=\"true\"></i><figcaption>" + response.firstname + " " + response.lastname + "</figcaption></a></li><a id='logout'><img class=\"imgs logout\" src=\"img/logout.png\"></a></div></div></ul></nav><div class=\"square1\"></div><div class=\"square2\"></div><div class=\"square3\"></div><div class=\"square4\"></div><div class=\"square5\"></div><div class=\"dashbutton\" id=\"startScan\"></div><img src=\"img/vhoek.png\" class=\"dashvhoek\">";	
	
	// <li class=\"cd-label\"><a href=\"#\"><i class=\"fa fa-bar-chart\" aria-hidden=\"true\"></i><figcaption>Overview</figcaption></a></li><li class=\"cd-label\"><a href=\"#\"><i class=\"fa fa-users\" aria-hidden=\"true\"></i><figcaption>Manage</figcaption></a></li><a href=\"#\"><img class=\"questionMark\" src=\"img/questionMark.png\"></a>
	
	//Zorgt ervoor dat de gebruiker kan uitloggen wanneer hij op de knop klikt
	document.getElementById("logout").onclick = function () { 
		clearInterval(window.localStorage.getItem("checkLogin"));
		logOut(); 
	};
	
	window.localStorage.setItem("checkLogin", setInterval(function () { checklogin(); }, 2000));
	
	//open/close primary navigation
	document.getElementsByClassName("cd-primary-nav-trigger")[0].addEventListener('click', function(){
		document.getElementsByClassName("cd-menu-icon")[0].classList.toggle('is-clicked'); 
		document.getElementsByClassName("cd-header")[0].classList.toggle('menu-is-open');
		
		//in firefox transitions break when parent overflow is changed, so we need to wait for the end of the trasition to give the body an overflow hidden
		if(document.getElementsByClassName("cd-primary-nav")[0].classList.contains('is-visible') ) {
			$('.cd-primary-nav').removeClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',function(){
				$('body').removeClass('overflow-hidden');
			});
		} else {
			$('.cd-primary-nav').addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',function(){
				$('body').addClass('overflow-hidden');
			});	
		}
	}, false);
	
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
				var userId = window.localStorage.getItem("userId");
				var token = window.localStorage.getItem("token");
				var httpQRLogin = new XMLHttpRequest();
				result = JSON.parse(result.text);

				if (result.data[0] == 1) {
					var paramsQRLogin = "userId=" + userId + "&token=" + token + "&clientId=" + result.data[1];
					httpQRLogin.open("POST", url, true);

					//Send the proper header information along with the request
					httpQRLogin.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					httpQRLogin.onreadystatechange = function() {
						if(httpQRLogin.readyState == 4 && httpQRLogin.status == 200) {
							if(httpQRLogin.responseText == 1) {
								
							}
						}
					};
					httpQRLogin.send(paramsQRLogin);
				} else if (result.data[0] == 2) {
					var paramsQRLogin = "userId=" + userId + "&token=" + token + "&lessonToken=" + result.data[1];
					httpQRLogin.open("POST", url, true);

					//Send the proper header information along with the request
					httpQRLogin.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					httpQRLogin.onreadystatechange = function() {
						if(httpQRLogin.readyState == 4 && httpQRLogin.status == 200) {
							if(httpQRLogin.responseText == 1 ) {

							}
						}
					};
					httpQRLogin.send(paramsQRLogin);
				}
			},
			function (error) {
				alert("Scanning failed: " + error);
			},
			{
				preferFrontCamera : false, // iOS and Android
				showFlipCameraButton : false, // iOS and Android
				showTorchButton : false, // iOS and Android
				torchOn: false, // Android, launch with the torch switched on (if available)
				prompt : "", // Android
				resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
				formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
				orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
				disableAnimations : false, // iOS
				disableSuccessBeep: false // iOS
			}	
		);
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
					clearInterval(window.localStorage.getItem("checkLogin"));
					logOut();
				}
			} else if (http.readyState == 4) {
				clearInterval(window.localStorage.getItem("checkLogin"));
				logOut();
			}
		};
		http.send(params);
	} else {
		clearInterval(window.localStorage.getItem("checkLogin"));
		logOut();
	}
}

checklogin(true);

