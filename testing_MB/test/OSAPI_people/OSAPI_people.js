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
				makeOSAPIpeopleCall();
			}

			init();
		}
    };
}();
