var user = {};
var globals = {};
var game = {};
var loggedIn = false;



function saveUser() {

	localStorage.setItem("user", JSON.stringify(user));

}

function getUser() {
	
	return JSON.parse(localStorage.getItem("user"));

}


function setSettings() {
	

	if(typeof user.settings == "undefined") {
		
		user.settings = {
			playSounds: false,
			useMeters: true
		};
		
		$("#useMeters").attr("checked",true).checkboxradio("refresh");
	
	} else {
		
		$("#playSounds").attr("checked",user.settings.playSounds).checkboxradio("refresh");
	
		$("#useMeters").attr("checked",user.settings.useMeters).checkboxradio("refresh");
	}
	
	
	
	//Time to set the user information
	$("#emailOpt").html(user.email);
	$("#firstnameOpt").html(user.firstname);
	$("#lastnameOpt").html(user.lastname);

}

function saveSettings() {
	
	
	var ps = ($("#playSounds").attr("checked") == "checked") ? true : false;
	
	var um = ($("#useMeters").attr("checked") == "checked") ? true : false;
	
	
	/*var ps = $("#playSounds").attr("checked");
	var um = $("#useMeters").attr("checked");*/
	
	user.settings = {
	
		playSounds: ps,
		useMeters: um
	
	};
	
	
	saveUser();
	
	var u = getUser();
	
	user = u;


	$.mobile.changePage("#mainUI", "slideup");


}




function login() {
	
	var loginForm = $("#loginForm");
	
	var em = loginForm.find("#email").val();
	
	var pass = loginForm.find("#password").val();
	
	
	var onSuccess = function(results) {
		
		if(results.status === true) {
		
			loggedIn = true;
		
			user.firstname = results.data.firstname;
			user.lastname = results.data.lastname;
			user.email = em;
			user.password = pass;
			
			//Time to store a new user object to local storage
			
			var oldUser = getUser();
			
			if(typeof oldUser == "undefined" || oldUser == null) {
			
				user.stats = {
	
					totalTime: 0,
					totalPoints: 0,
					totalGames: 0,
					totalCheckpoints: 0,
					totalMiles: 0,
					gamesLost: 0,
					gamesWon: 0,
					calories: 0
				
				};
				
				user.settings = {
	
					playSounds: false,
					useMeters: true
				
				};
				
				saveUser();
			
			} else if(typeof oldUser != "undefined" && oldUser.email == user.email) {
				
				user = oldUser;
				
			
			} else {
			
				user.stats = {
	
					totalTime: 0,
					totalPoints: 0,
					totalGames: 0,
					totalCheckpoints: 0,
					totalMiles: 0,
					gamesLost: 0,
					gamesWon: 0,
					calories: 0
				
				};
				
				user.settings = {
	
					playSounds: false,
					useMeters: true
				
				};
				
				saveUser();
			
			}
			
			
			
			
			
			
			
			
			$.mobile.changePage("#mainUI", "slideup");
		
		} else if(typeof results.status == "boolean") {
		
			alert("Wrong Username/Password");
		
		} else {
			
			alert("Sorry, system is unavialable");
		
		}
	
	};
	
	
	$.ajax({
	
		type: "POST",
		url: "http://ec2-23-20-140-88.compute-1.amazonaws.com/login.php",
		data: {"email": em, "password": pass},
		success: onSuccess,
		dataType: "json"
	
	});

}


function resetStats() {

	user.stats = {
	
		totalTime: 0,
		totalPoints: 0,
		totalGames: 0,
		totalCheckpoints: 0,
		totalMiles: 0,
		gamesLost: 0,
		gamesWon: 0,
		calories: 0
	
	};
	
	
	saveUser();
	
	var u = getUser();
	
	if(u.stats.totalTime == 0 && u.stats.totalPoints == 0) {
		
		return true;
	
	} else {
	
		return false;
		
	}

}



function setStatistics() {
	
	var u = getUser();
	
	if(typeof u.stats == "undefined" || u.stats == null) {
		
		
		user.stats = {
	
			totalTime: 0,
			totalPoints: 0,
			totalGames: 0,
			totalCheckpoints: 0,
			totalMiles: 0,
			gamesLost: 0,
			gamesWon: 0,
			calories: 0
		
		};
		
		
		saveUser();
		
		
	
	} else {
	
		user.stats = u.stats;
	
	}
	
	var miles = (user.stats.totalMiles % 60) / 1609;
	//var meters = Math.floor(miles * 100) / 100;
	
	var meters = (user.settings.useMeters) ? user.stats.totalMiles : Math.floor(miles * 100) / 100;
	
	var mesurment = (user.settings.useMeters) ? "Meters" : "Miles";
	$("#totalDist").html(meters + " <span>" + mesurment + "</span>");
	$("#totalTime").html((Math.floor((user.stats.totalTime / 3600) * 100) / 100) + " <span>Hours</span>");
	$("#totalPoints").html(user.stats.totalPoints);
	$("#totalGames").html(user.stats.totalGames);
	$("#gamesWon").html(user.stats.gamesWon);
	$("#gamesLost").html(user.stats.gamesLost);


}



