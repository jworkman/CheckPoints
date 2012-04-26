


function updatePosition(pos) {
	
	//Update the current position in the globals
	game.currentPosition = pos;
	
	
	game.startMarker.setPosition(
	
		new google.maps.LatLng(
			pos.latitude,
			pos.longitude
		)
	
	);
	

}



function updateDistance() {

	game.directions = new google.maps.DirectionsService();
	var lat = game.finishMarker.getPosition().lat();
	var lng = game.finishMarker.getPosition().lng();
	var des = new google.maps.LatLng(lat, lng);
	game.directions.route({
	
	
			origin: new google.maps.LatLng(game.currentPosition.latitude, game.currentPosition.longitude),
			
			destination: des,
					
			travelMode: google.maps.TravelMode.WALKING
		
		
		}, 
		
		function(DirectionsResult, DirectionsStatus) {
			
			var distance = 0;
			
			for(var i = 0, j = DirectionsResult.routes[0].legs.length; i < j; i++) {
		
				distance += DirectionsResult.routes[0].legs[i].distance.value;
			
			}
			
			
			
			game.startingDistance = (game.startingDistanceSet === true) ? game.startingDistance : distance;
			game.totalCheckPoints = Math.ceil(game.startingDistance / 60);
			game.currentDistance = distance;
			
			game.startingDistanceSet = true;
			
			//Run the update
			updateGame();
			
		}
	);

}

function eraseGame() {

	user.stats.totalMiles += game.startingDistance - game.currentDistance;
	user.stats.totalGames += 1;
	navigator.geolocation.clearWatch(game.watch);
	clearInterval(game.timer);
	
	delete game.currentDistance;
	delete game.finishMarker;
	delete game.DirectionsService;
	delete game.map;
	delete game.setupMap;
	
	saveUser();
	

}


function looseGame() {
	
	if(typeof game.alertBool == "undefined") {
	
		alert("Game Over!");
		$.mobile.changePage('#dialog', 'pop');
	
	} else {
	
		clearInterval(game.timer);
	
	}
	
	game.alertBool = true;
	user.stats.gamesLost += 1;
	eraseGame();

}


function winGame() {

	alert("Game won!");
	user.stats.gamesWon += 1;
	eraseGame();

}

function updateGame() {

	if(game.currentDistance < 50) {
		
		winGame();
	
	}
	
	
	if(game.currentDistance > (game.lastCheckPoint + 60)) {
		
		game.currentTimeLeft += 80;
		game.lastCheckPoint += 60;
		game.currentPoints += 100;
		user.stats.totalPoints += 100;
	
	}

}


function updateTime() {
	user.stats.totalTime += 1;
	if(game.currentTimeLeft < 1) {
		
		game.currentTimeLeft = 0;
		$("#timeLeft").html(game.currentTimeLeft);
		looseGame();
	
	} else {
	
		game.currentTimeLeft -= 1;
	
	}
	
	$("#timeLeft").html(game.currentTimeLeft);
	
	
	
	if(typeof user.settings.useMeters == "undefined" || user.settings.useMeters === true) {
		//alert(game.startingDistance);
		//var meters = Math.floor(((globals.totalDistance % 60) / 1609.344) * 100) / 100;
		var meters = Math.floor(game.startingDistance % 60);
		$("#meters").next().html("Meters");
		
	} else {
	
		//var meters = Math.floor((((globals.totalDistance % 60) / 1609.344)) * 100) / 100;
		var miles = (game.startingDistance % 60) / 1609;
		var meters = Math.floor(miles * 100) / 100;
		$("#meters").next().html("Miles");
		
	}
	
	$("#meters").html(meters);
	$("#points").html(game.currentPoints);
	
}




function startGame() {

	game.lastCheckPoint = 0;
	game.currentTimeLeft = 80;
	game.currentPoints = 0;

	var mapOptions = {
	  center: new google.maps.LatLng(game.startingLocation.coords.latitude, game.startingLocation.coords.longitude),
	  zoom: 15,
	  mapMarker: true,
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	game.map = new google.maps.Map(document.getElementById("runningMap"), mapOptions);
	
	
	addStartMarker(game.map);
	
	//alert(game.finishMarker.getPosition().lat());
	addFinishMarker(
		game.map, 
		game.finishMarker.getPosition().lat(), 
		game.finishMarker.getPosition().lng(),
		true
	);
	
	game.timer = setInterval(updateTime, 1000);
	
	//Time to start the watch
	game.watch = navigator.geolocation.watchPosition(
	
		//On watch success
		function(position) {
			
			updatePosition(position);
			updateDistance();
		
		}, 
		
		//On error
		function(error) {
		
		
		},
		
		{
			maximumAge: 1000, 
			timeout: 5000, 
			enableHighAccuracy: true
		}
	
	);
	

}




function addStartMarker(map) {

	game.startMarker = new google.maps.Marker({
				
		position: new google.maps.LatLng(game.startingLocation.coords.latitude, game.startingLocation.coords.longitude),
		map: map,
		title: "Start",
		icon: "http://www.google.com/mapfiles/arrow.png"
		
	});

}


function addFinishMarker(map, lat, lng, override) {

	/*game.finishMarker = new google.maps.Marker({
				
		position: new google.maps.LatLng(lat, lng),
		map: map,
		title: "Finish",
		icon: "IMAGES/finishFlag.png"
		
	});*/
	
	game.directions = new google.maps.DirectionsService();
	var des = new google.maps.LatLng(lat, lng);
	var lati = game.startMarker.getPosition().lat();
	var lngi = game.startMarker.getPosition().lng();
	game.directions.route({
	
	
			origin: new google.maps.LatLng(lati, lngi),
			
			destination: des,
					
			travelMode: google.maps.TravelMode.WALKING
		
		
	}, 
		
		function(DirectionsResult, DirectionsStatus) {
			
			var distance = 0;
			
			for(var i = 0, j = DirectionsResult.routes[0].legs.length; i < j; i++) {
		
				distance += DirectionsResult.routes[0].legs[i].distance.value;
			
			}
			
			//alert(DirectionsResult.routes[0].legs[0].distance.text);
			
			if(distance > 1000) {
				
				if(typeof override != "undefined" && override === false && typeof game.finishMarkerSet != "undefined" && game.finishMarkerSet === true) {
				
					game.finishMarker.setPosition(new google.maps.LatLng(lat, lng));
					
					
				} else {
				
					game.finishMarker = new google.maps.Marker({
				
						position: new google.maps.LatLng(lat, lng),
						map: map,
						title: "Finish",
						icon: "IMAGES/finishFlag.png"
						
					});
					
					game.finishMarkerSet = true;
				
				}
				
				game.startingDistance = distance;
				game.startingDistanceSet = true;
				
				game.placedFinish = true;
				
				$("#startRunningBtn").button('enable');
			
			} else {
			
				alert("The point you have picked is too close to the starting point!");
			
			}
			
		}
	);

}


function initSetupMap() {

	var mapOptions = {
	  center: new google.maps.LatLng(game.startingLocation.coords.latitude, game.startingLocation.coords.longitude),
	  zoom: 15,
	  mapMarker: true,
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	game.setupMap = new google.maps.Map(document.getElementById("choosePointMap"), mapOptions);
	
	
	//Add the start marker
	addStartMarker(game.setupMap);
	
	google.maps.event.addListener(game.setupMap, 'click', function(event) {
		
		addFinishMarker(game.setupMap, event.latLng.lat(), event.latLng.lng());
	
	});

}






function initSetupRunMap() {

	//First we will get the current location of the user
	if(navigator.geolocation) {
		//alert("asdf");
		navigator.geolocation.getCurrentPosition(
		
			//Success
			function(position) {
				
				game.startingLocation = position;
				initSetupMap();
			
			}, 
			
			//Error
			function(error) {
			
				alert("Sorry but your location could not be determined!");
			
			}
		
		
		);
	
	}

}