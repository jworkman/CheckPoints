function setupNav(){
	
	$("#alternative3").bind("click", function(e){
	
		$.mobile.changePage("#howToPlay", "slideup");
	
	});

	$("#email").bind("click", function(e){
		
		var that = $(this);
		
		
		
		if(that.val() == "Email Address") {
		
			that.val("");
		
		} 
	
	});
	
	$("#password").bind("click", function(e){
		
		var that = $(this);
		
		
		
		if(that.val() == "Password") {
		
			that.val("");
		
		} 
	
	});
	
	
	$("#loginForm").bind("submit", function(e){
		
		login();
        
		
		e.preventDefault();
	
	});

	
    $(".back").bind("click", function(e){
	
		if(loggedIn === false) {
			$.mobile.changePage("#login", "slideup");
		} else {
			
			$.mobile.changePage("#mainUI", "slideup");
		
		}
    });
	
	
	$("#mainUITile1").bind("click", function(e){
		
		$.mobile.changePage("#runSetup", "slideup");
		var runBtn = $("#startRunningBtn");
		runBtn.button('disable');
		
		$("#startRunningBtn").bind("click", function(e){
		
			if(typeof game.placedFinish != "undefined" && game.placedFinish === true) {
				
				$.mobile.changePage("#running", "slideup");
				
				startGame();
			
			}
		
			e.preventDefault();
		
		});
		
		
		
		
		initSetupRunMap();
		
		
		e.preventDefault();
	
	});
	
	
	$("#alternative1").bind("click", function(e){
		
		
		$.mobile.changePage("#signUpPage", "slideup");
		
		
		var form = $("#signUpForm");
		
		$("#signUpBtn").bind("click", function(e){
			
			var em = form.find("#signUpEmail").val();
			var fn = form.find("#signUpFn").val();
			var ln = form.find("#signUpLn").val();
			var pass = form.find("#signUpPass").val();
			
			
			var onSuccess = function(results) {
				
				if(typeof results.status === "boolean" && results.status === true) {
					
					alert("Thank you for signing up with CheckPoints!");
					
					user.firstname = fn;
					user.lastname = ln;
					user.email = em;
					user.password = pass;
					
					localStorage.setItem("user", JSON.stringify(user));
					
					
					$.mobile.changePage("#mainUI", "slideup");
					
					
					
				} else if(typeof results.status === "boolean" && results.status === false) {
					
					alert(results.msg);
				
				} else {
				
					alert("Sorry, but you can not signup at this time!");
				
				}
			
			};
			
			
			$.ajax({
	
				type: "POST",
				url: "http://ec2-23-20-140-88.compute-1.amazonaws.com/signup.php",
				data: {"email": em, "password": pass, "firstname": fn, "lastname": ln},
				success: onSuccess,
				dataType: "json"
			
			});
			
			
			
			e.preventDefault();
		
		});
	
	
		e.preventDefault();
	
	});
	
	
	
	$("#mainUITile2").bind("click", function(e){
	
	
		$.mobile.changePage("#howToPlay", "slideup");
		
	
	});
	
	
	$("#mainUITile3").bind("click", function(e){
	
		
		
		
		$.mobile.changePage("#statistics", "slideup");
		
		setStatistics();
		
	
	});
	
	
	$("#mainUITile4").bind("click", function(e){
	
	
		$.mobile.changePage("#settings", "slideup");
		//$("#playSounds").attr("checked",true).checkboxradio("refresh");
		setSettings();
		
		$("#resetStatsButton").bind("click", function(e){
		
			if(resetStats() === true) {
			
				alert("You're statistics were reset!");
			
			} else {
				
				alert("Sorry, but your statistics could not be reset!");
			
			}
		
		});
		
		$("#saveSettings").bind("click", function(e){
		
			saveSettings();
		
		});
		
	
	});
	
	
	
	$("#setNewGame").on("click", function(e){
	
		$.mobile.changePage('#setupRun', 'slideup');
	
		//e.preventDefault();
		
		var runBtn = $("#startRunningBtn");
		runBtn.button('disable');
		
		$("#startRunningBtn").bind("click", function(e){
		
			if(typeof game.placedFinish != "undefined" && game.placedFinish === true) {
				
				$.mobile.changePage("#running", "slideup");
				
				startGame();
			
			}
		
			e.preventDefault();
		
		});
		
		
		
		
		initSetupRunMap();
		
		
		e.preventDefault();
	
	});
	
	
	$("#goToStats").on("click", function(e){
	
		$.mobile.changePage('#statistics', 'slideup');
	
		//e.preventDefault();
	
	});
	
	
                  
};



$(document).ready(function(){
	
	
	var ls = localStorage.getItem("user");
	
	
	if(typeof ls != "undefined" && ls != null) {
	
		$("#email").val(JSON.parse(ls).email);
		$("#password").val(JSON.parse(ls).password);
	
	}
	
	
	setupNav();

});


