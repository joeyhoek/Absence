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


window.onload = function () {
	shakeFix(1500);
};

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
			
			showLogin();
		} else {
			showLogin();
		}
	};
	http.send(params);
}

// When App starts
// API URL
var url = "http://absence.innovatewebdesign.nl/api/mobileClient.php";

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

// Page Login
function showLogin() {
	document.getElementById("content").innerHTML = "<div class=\"rectangle\"></div><form class=\"form\" onsubmit=\"return document.loginForm.user.value != '' && document.loginForm.pass.value != ''\"><img src=\"img/logo.png\" class=\"logo\" ><input type=\"email\" id=\"username\" data-dependency=\"first\" name=\"username\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"user\" src=\"img/user_icon.png\"><br /><input type=\"password\" name=\"password\" id=\"password\" data-dependency=\"second\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"lock\" src=\"img/lock_icon.png\"><br /><input type=\"button\" id=\"submit\" value=\"Sign In\" /><br><a href=\"#\" onclick=\"showForgotPassword();\">Forgot Password?</a></form>";
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

				if (response["username"] == username) {
					window.localStorage.setItem("loggedIn", 1);
					window.localStorage.setItem("userid", response["userid"]);
					window.localStorage.setItem("token", response["token"]);
					showLoggedIn(response);
				} else {
					loginForm.classList.add("error");
					shake();
					alert("Wrong password");
				}
			} else {
				shake();
				loginForm.classList.add("error");
			}
		};
		http.send(params);
	}
}

function showLoginFromPassword() {
	var form = document.getElementsByClassName("form")[0];
	form.classList.add("aniOut");
	form.classList.remove("aniIn");
	var rectangle = document.getElementsByClassName("rectangle")[0];
	rectangle.classList.add("notSmall");
	rectangle.classList.remove("small");
	window.setTimeout(function () {
		form.classList.add("aniIn");
		form.classList.remove("aniOut");
		form.innerHTML = "<img src=\"img/logo.png\" class=\"logo\" ><input type=\"email\" id=\"username\" data-dependency=\"first\" name=\"username\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"user\" src=\"img/user_icon.png\"><br /><input type=\"password\" name=\"password\" id=\"password\" data-dependency=\"second\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"lock\" src=\"img/lock_icon.png\"><br /><input type=\"button\" id=\"submit\" value=\"Sign In\" /><br><a href=\"#\" onclick=\"showForgotPassword();\">Forgot Password?</a>";
		form.classList.remove("forgotPassword");
		form.classList.remove("submitted");
		form.classList.remove("error");
		shakeFix(800);
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

					if (response["username"] == username) {
						window.localStorage.setItem("loggedIn", 1);
						window.localStorage.setItem("userid", response["userid"]);
						window.localStorage.setItem("token", response["token"]);
						showLoggedIn(response);
					} else {
						loginForm.classList.add("error");
						shake();
						alert("Wrong password");
					}
				} else {
					shake();
					loginForm.classList.add("error");
				}
			};
			http.send(params);
		};
	}, 500);
}

// Page Forgot Password
function showForgotPassword() {
	var form = document.getElementsByClassName("form")[0];
	form.classList.add("aniOut");
	form.classList.remove("aniIn");
	var rectangle = document.getElementsByClassName("rectangle")[0];
	rectangle.classList.add("small");
	rectangle.classList.remove("notSmall");
	window.setTimeout(function () {
		form.classList.add("aniIn");
		form.classList.remove("aniOut");
		form.innerHTML = "<h2>Reset Password</h2><input type=\"email\" id=\"username\" data-dependency=\"first\" name=\"username\" autocapitalize=\"off\" autocomplete=\"new-password\" onfocus=\"hideCopyright();\" onblur=\"showCopyright();\" required autocorrect=\"off\" spellcheck=\"false\" /><img class=\"user\" src=\"img/user_icon.png\"><br /><input type=\"button\" id=\"submit\" value=\"Reset\" /><br><a href=\"#\" onclick=\"showLoginFromPassword();\"><- Go back to login</a>";
		form.classList.add("forgotPassword");
		form.classList.remove("submitted");
		form.classList.remove("error");
		shakeFixForgot(800);
		document.getElementById("submit").onclick = function () {
			form.classList.remove("error");
			form.classList.add("submitted");
			var username = document.getElementById("username").value;
			var http = new XMLHttpRequest();
			var params = "username=" + username;
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
						form.classList.add("error");
						shakeForgot();
						alert("Wrong password");
					}
				} else {
					shakeForgot();
					form.classList.add("error");
				}
			};
			http.send(params);
		};
	}, 500);
}

// Page Dashboard
function showDashboard(response) {
	document.getElementById("content").innerHTML = "<header class=\"cd-header\"><a class=\"cd-primary-nav-trigger\" href=\"#0\"><span class=\"cd-menu-icon\"></span></a></header><nav><ul class=\"cd-primary-nav\"><li class=\"cd-label\"><a href=\"#\"><i class=\"fa fa-tachometer\" aria-hidden=\"true\"></i><figcaption>Dashboard</figcaption></a></li><li class=\"cd-label\"><a href=\"#\"><i class=\"fa fa-bar-chart\" aria-hidden=\"true\"></i><figcaption>Overview</figcaption></a></li><li class=\"cd-label\"><a href=\"#\"><i class=\"fa fa-users\" aria-hidden=\"true\"></i><figcaption>Manage</figcaption></a></li><div class=\"profile\"><li class=\"cd-label\"><a href=\"#\"><i class=\"fa fa-user\" aria-hidden=\"true\"></i><figcaption><?php echo (new User($_SESSION[\"userId\"]))->getFirstname() . \" \" . (new User($_SESSION[\"userId\"]))->getLastname(); ?></figcaption></a></li><a href=\"/?action=logout\"><img class=\"imgs logout\" src=\"img/logout.png\"></a></div><a href=\"#\"><img class=\"questionMark\" src=\"img/questionMark.png\"></a></ul></nav><div class=\"square1\"></div><div class=\"square2\"></div><div class=\"square3\"></div><div class=\"square4\"></div><div class=\"square5\"></div><div class=\"dashbutton\"></div><img src=\"img/vhoek.png\" class=\"dashvhoek\"><br /><button id=\"logout\" class=\"dashlogout\">Logout</button>";
	
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
// Zorgt voor inlog, zonder values in te vullen
var response = {
	firstname: 'Trishul',
	lastname: 'Manna'
};
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
				showDashboard(response);
			} else {
				window.localStorage.removeItem("loggedIn");
				window.localStorage.removeItem("userid");
				window.localStorage.removeItem("token");
				showDashboard(response);
			}
		} else {
			window.localStorage.removeItem("loggedIn");
			window.localStorage.removeItem("userid");
			window.localStorage.removeItem("token");
			showDashboard(response);
		}
	};
	http.send(params);
} else {
	showDashboard(response);
}
