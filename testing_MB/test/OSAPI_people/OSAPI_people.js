var urlController = function() {
    return {
		init: function(gadget) {
		    var displayFrame = $("<iframe id='url-frame' class='url-gadget-display-frame' src=''></iframe>");
		    var display = $(gadget).find("#display");

			function makeOSAPIpeopleCall(){
				osapi.people.getOwner().execute(function(data) {

					console.log("Logging everything from osapi.people.getOwner");
					console.log("---------------------------------------------");
					console.dir(data);
					console.log("data = " + data);
					console.log("data.id = " + data.id);
					console.log("data.displayName = " + data.displayName);
					console.log("data.name.givenName = " + data.name.givenName);
					console.log("data.name.familyName = " + data.name.familyName);
					console.log("data.name.givenName = " + data.name.givenName);
					console.log("data.emails[0] = " + data.emails[0]);
					console.log("data.thumbnailUrl = " + data.thumbnailUrl);
					console.log("---------------------------------------------");
					
					// This is here because there's a bug.
					if (!data.emails[0]){
						url = "https://whoknows.com/app/profiles/embed/yourEmailAddress@whoknows.com";
					}
					else {
						url = "https://whoknows.com/app/profiles/embed/" + data.emails[0];
					}

					console.log("navigating to: " + url);
					displayFrame.slideDown();
					displayFrame.attr("src", url);
				});
			}

		    function init() {
		    	display.append(displayFrame);
				makeOSAPIpeopleCall();
			}

			init();
		}
    };
}();
