function appendText() {
	var txt1 = "<p>Logging everything from osapi.people.getOwner</p>";
	txt1 += "<p>---------------------------------------------</p>";
	$("body").append(txt1);
}

function makeOSAPIpeopleCall(){
	osapi.people.getOwner().execute(function(data) {
		var osapiOutput = "<p>Logging everything from osapi.people.getOwner</p>";
		osapiOutput += "<p>---------------------------------------------</p>";
		osapiOutput += "<p>data = + data</p>";
		osapiOutput += "<p>data.id = + data.id</p>";
		osapiOutput += "<p>data.displayName = + data.displayName</p>";
		osapiOutput += "<p>data.givenName = + data.givenName</p>";
		osapiOutput += "<p>data.familyName = + data.familyName</p>";
		osapiOutput += "<p>data.nickname = + data.nickname</p>";
		osapiOutput += "<p>data.email = + data.email</p>";
		osapiOutput += "<p>data.thumbnailUrl = + data.thumbnailUrl</p>";
		$("body").append(osapiOutput);

		/*
		console.log("Logging everything from osapi.people.getOwner");
		console.log("---------------------------------------------");
		console.log("data = " + data);
		console.log("data.id = " + data.id);
		console.log("data.displayName = " + data.displayName);
		console.log("data.givenName = " + data.givenName);
		console.log("data.familyName = " + data.familyName);
		console.log("data.nickname = " + data.nickname);
		console.log("data.email = " + data.email);
		console.log("data.thumbnailUrl = " + data.thumbnailUrl);
		console.log("---------------------------------------------");
		
		// This is here because there's a bug.
		if (!data.email){
			url = "https://whoknows.com/app/profiles/embed/yourEmailAddress@whoknows.com";
		}
		else {
			url = "https://whoknows.com/app/profiles/embed/" + data.email;
		}

		console.log("navigating to: " + url);
		displayFrame.slideDown();
		displayFrame.attr("src", url);
		*/
	});

}


/*
var urlController = function() {
    return {
		init: function(gadget) {
		    var displayFrame = $("<iframe id='url-frame' class='url-gadget-display-frame' src=''></iframe>");
		    var display = $(gadget).find("#display");
			
			function makeOSAPIpeopleCall(){
				osapi.people.getOwner().execute(function(data) {

					console.log("Logging everything from osapi.people.getOwner");
					console.log("---------------------------------------------");
					console.log("data = " + data);
					console.log("data.id = " + data.id);
					console.log("data.displayName = " + data.displayName);
					console.log("data.givenName = " + data.givenName);
					console.log("data.familyName = " + data.familyName);
					console.log("data.nickname = " + data.nickname);
					console.log("data.email = " + data.email);
					console.log("data.thumbnailUrl = " + data.thumbnailUrl);
					console.log("---------------------------------------------");
					
					// This is here because there's a bug.
					if (!data.email){
						url = "https://whoknows.com/app/profiles/embed/yourEmailAddress@whoknows.com";
					}
					else {
						url = "https://whoknows.com/app/profiles/embed/" + data.email;
					}

					console.log("navigating to: " + url);
					displayFrame.slideDown();
					displayFrame.attr("src", url);
				});
			}

		    function init() {
		    	display.append(displayFrame);
		    	appendText();
				//makeOSAPIpeopleCall();
			}

			init();
		}
    };
}();
*/
