// If you want to prevent dragging, uncomment this section
/*
function preventBehavior(e) 
{ 
  e.preventDefault(); 
};
document.addEventListener("touchmove", preventBehavior, false);
*/

/* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
for more details -jm */
/*
function handleOpenURL(url)
{
	// TODO: do something with the url passed in.
}
*/

//Setup the globals object
var globals = {};

function onBodyLoad()
{		
	document.addEventListener("deviceready", onDeviceReady, false);
}

/* When this function is called, Cordova has been initialized and is ready to roll */
/* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
for more details -jm */
function onDeviceReady()
{
	// do your thing!
	//navigator.notification.alert("Cordova is working");
}



function eraseGame() {
	
	navigator.geolocation.clearWatch(globals.watch);
	
	
	clearInterval(globals.timer);
	
	delete globals.map;
	delete globals.directions;
	delete globals.origin;
	delete globals.destination;
	delete globals.currentDistance;
	delete globals.lastDistance;
	delete globals.userMarker;
	delete globals.currentTimeLeft;
	delete globals.completedCheckpoints;
	delete globals.currentPoints;
	delete globals.timer;
	delete globals.startingMarker;
	delete globals.checkpointsLeft;
	delete globals.lastCheckpointsLeft;
	delete globals.watch;
	delete globals.startingLocation;
	
	globals = {};
	
	
	//Erase the map itself
	$("#runningMap").empty();
	$("#choosePointMap").empty();
	
	
	saveUser();

}


function updateDistance() {

	globals.directions = new google.maps.DirectionsService();
		
	globals.origin = new google.maps.LatLng(globals.userMarker.getPosition().lat(), globals.userMarker.getPosition().lng());
	globals.destination = new google.maps.LatLng(globals.finishMarker.getPosition().lat(), globals.finishMarker.getPosition().lng());

	
	globals.directions.route({
	
		origin: globals.origin,
		
		destination: globals.destination,	
		travelMode: google.maps.TravelMode.WALKING
		
		
	
	}, function(DirectionsResult, DirectionsStatus){
		globals.lastDistance = globals.currentDistance;
		//Now to store the directions
		globals.currentDistance = 0;
			
		for(var i = 0, j = DirectionsResult.routes[0].legs.length; i < j; i++) {
		
			globals.currentDistance = Number(globals.currentDistance) + Number(DirectionsResult.routes[i].legs[i].distance.value);
		
		}
		
		updateGlobals();
		
	});

}

function gameOver(){
	
	
	user.stats.totalMiles += globals.totalDistance;
	
	
	eraseGame();
	
	$.mobile.changePage("#mainUI", "slideup");
	
	alert("You won!");
	
}


function updateUI() {

	$("#timeLeft").html(globals.currentTimeLeft);
	
	
	
	if(typeof user.settings.useMeters == "undefined" || user.settings.useMeters === true) {
		
		//var meters = Math.floor(((globals.totalDistance % 60) / 1609.344) * 100) / 100;
		var meters = Math.floor(globals.totalDistance % 60);
		$("#meters").next().html("Meters");
		
	} else {
	
		//var meters = Math.floor((((globals.totalDistance % 60) / 1609.344)) * 100) / 100;
		var miles = (globals.totalDistance % 60) / 1609;
		var meters = Math.floor(miles * 100) / 100;
		$("#meters").next().html("Miles");
		
	}
	
	$("#meters").html(meters);
	$("#points").html(globals.currentPoints);

}

function gameLost() {

	eraseGame();
	
	$.mobile.changePage("#mainUI", "slideup");

	alert("Game Over. You lost!");

}

function updateTime() {

	globals.currentTimeLeft -= 1;
	user.stats.totalTime += 1;
	
	if(globals.currentTimeLeft < 1) {
	
		gameLost();
		user.stats.totalGames += 1;
		user.stats.gamesLost += 1;
		
	
	}
	
	updateUI();

}


function updateGlobals() {

	//updateDistance();
	
	
	var distanceTraveled = globals.totalDistance - globals.currentDistance;
	
	
	if(globals.currentDistance <= 25) {
		alert(globals.currentDistance);
		gameOver();
		return true;
	
	}
	
	
	if((Math.floor((distanceTraveled / 60) * 100) / 100) > globals.lastCheckpoint && (Math.floor((distanceTraveled / 60) * 100) / 100) >= 1) {
	
		//next checkpoint
		alert("Checkpoint Reached");
		globals.lastCheckpoint += 1;
		globals.currentTimeLeft += 80;
	
	} 
	
	

}



function startGame() {
	
	globals.currentTimeLeft = 80;
	globals.completedCheckpoints = 0;
	globals.currentPoints = 0;
	globals.timer = setInterval(updateTime, 1000);
	globals.lastCheckpoint = 0;
	globals.currentDistance = 0;

	var onWatchUpdate = function(position) {
		
		//Update your location marker on the map
		var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		globals.userMarker.setPosition(latLng);
		
		
		//updateGlobals();
		
		updateDistance();
		
		
	}
	
	var onWatchError = function() {
		alert("Could not get your location");
	}
	
	//First we set the geolocation watch
	globals.watch = navigator.geolocation.watchPosition(onWatchUpdate, onWatchError, {
		maximumAge: 1000, 
		timeout: 5000, 
		enableHighAccuracy: true
	});
	
	
	$("#stopRunBtn").bind("click", function(e){
	
		user.stats.gamesLost += 1;
		user.stats.totalGames += 1;
		
		eraseGame();
		
		$.mobile.changePage("#mainUI", "slideup");
		
		e.preventDefault();
	
	});


}


function setupGame() {
	alert("Start running!");
	
	globals.completedCheckpoints = 0;
	
	//--------- This is for setting up the markers from the previous map ------//
	//console.log(location.coords.latitude);
	//console.log(location.coords.longitude);
	var lat = globals.startingLocation.coords.latitude;
	var lng = globals.startingLocation.coords.longitude;
	

	var myOptions = {
	  center: new google.maps.LatLng(lat, lng),
	  zoom: 15,
	  mapMarker: true,
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	globals.map = new google.maps.Map(document.getElementById("runningMap"), myOptions);
	
	globals.startMarker = new google.maps.Marker({    
	  position: new google.maps.LatLng(lat, lng),    
	  map: globals.map,
	  title: "Start"  
	});
	
	var finishLat = globals.finishMarker.getPosition().lat();
	var finishLng = globals.finishMarker.getPosition().lng();
	
	globals.finishMarker = new google.maps.Marker({
	
		position: new google.maps.LatLng(finishLat, finishLng),
		map: globals.map,
		title: "Finish"
	
	});
	
	
	//globals.startingLocation = location;
	//globals.map = map;
	//globals.startingMarker = startMarker;
	



	//--------- This if for setting up the actual game -------//
	
	globals.directions = new google.maps.DirectionsService();
		
	globals.origin = new google.maps.LatLng(globals.startMarker.getPosition().lat(), globals.startMarker.getPosition().lng());
	globals.destination = new google.maps.LatLng(globals.finishMarker.getPosition().lat(), globals.finishMarker.getPosition().lng());

	
	globals.directions.route({
	
		origin: globals.origin,
		
		destination: globals.destination,	
		travelMode: google.maps.TravelMode.WALKING
		
		
	
	}, function(DirectionsResult, DirectionsStatus){
	
		//Now to store the directions
		globals.totalDistance = Number(5);
			
		for(var i = 0, j = DirectionsResult.routes[0].legs.length; i < j; i++) {
		
			globals.totalDistance = Number(globals.totalDistance) + Number(DirectionsResult.routes[i].legs[0].distance.value);
		
		}
		
		globals.checkpointsLeft = Math.floor(globals.totalDistance / 60);
		globals.lastCheckpointsLeft = Math.floor(globals.totalDistance / 60);
		
		
		globals.checkPointInterval = Math.floor(globals.totalDistance / 60);
		
		if(typeof user.settings.useMeters == "undefined" || user.settings.useMeters === true) {
		
			var meters = "Meters";
			var dist = globals.totalDistance;
			
		} else {
		
			var meters = "Miles";
			var miles = (globals.totalDistance % 60) / 1609;
			var dist = Math.floor(miles * 100) / 100;
			
		}
		
		
		alert("The total distance is " + dist + " " + meters + ". You have " + globals.checkPointInterval + " checkpoints to get to. Run!");
		
		
		
		
		//Create the marker to indecate user
		globals.userMarker = new google.maps.Marker({
		
			map: globals.map,
			position: new google.maps.LatLng(globals.startingLocation.coords.latitude, globals.startingLocation.coords.longitude),
			title: "You"
		
		});
		
		startGame();
		
	});
	
	
	


}




function initSetupRunMap() {
	
	var runBtn = $("#startRunningBtn");
	runBtn.button('disable');
	
	var loopBoolean = false;
	
	navigator.geolocation.getCurrentPosition(function(location){
		
		if(loopBoolean === true) {
		
			return false;
		
		} else {
		
			loopBoolean = true;
		
		}
		
		globals.startingLocation = location;
	
		alert(location.coords.latitude);
		alert(location.coords.longitude);
	
		var myOptions = {
		  center: new google.maps.LatLng(location.coords.latitude, location.coords.longitude),
		  zoom: 15,
		  mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		globals.map = new google.maps.Map(document.getElementById("choosePointMap"), myOptions);
		
		/*globals.startMarker = new google.maps.Marker({    
		  position: new google.maps.LatLng(location.coords.latitude, location.coords.longitude),    
		  map: globals.map,
		  title: "Start"  
		});*/
		
		globals.startMarker = new google.maps.Marker({
			
			position: new google.maps.LatLng(location.coords.latitude, location.coords.longitude),
			map: globals.map,
			title: "Start"
		
		});
		
		google.maps.event.addListener(globals.map, 'click', function(event) {
			
			
			if(globals.finishedSetup === true) {
				
				return true;
			
			} else {
				
				globals.finishedSetup = true;
				runBtn.button('enable');
				
				runBtn.bind('click', function(e){
					
					$.mobile.changePage("#running", "slideup");
					setupGame();
				
				});
			
			}
			
			//placeMarker(event.latLng);
			var lat = event.latLng.lat();
			var lng = event.latLng.lng();
			
			var image = new google.maps.MarkerImage('IMAGES/finishFlag.png',
			  // This marker is 20 pixels wide by 32 pixels tall.
			  new google.maps.Size(20, 32),
			  // The origin for this image is 0,0.
			  new google.maps.Point(0,0),
			  // The anchor for this image is the base of the flagpole at 0,32.
			  new google.maps.Point(0, 32));
			
			/*var image = new google.maps.MarkerImage(
				"IMAGES/finishFlag.png",
				new google.maps.Size(37, 32),
				new google.maps.Point(0,0),
				new google.maps.Point(0, 32)
			);*/
			
			globals.finishMarker = new google.maps.Marker({
			
				position: new google.maps.LatLng(lat, lng),
				map: globals.map,
				title: "Finish",
				icon: "IMAGES/finishFlag.png",
			
			});
			
			
			
			
			
		});
	
	});
	
	
	
	


}





