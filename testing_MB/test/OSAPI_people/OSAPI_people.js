var urlController = function() {
    return {
		init: function(gadget) {
		    var displayFrame = $("<iframe id='url-frame' class='url-gadget-display-frame' src=''></iframe>");
		    var display = $(gadget).find("#display");
		    
			function makeODataCall(){
			  gadgets.io.makeRequest("https://developer.sapjam.com/api/v1/OData/Self?$format=json",
			    function(result) {
			      console.log("Email Address: " + result.data.d.results.Email);
			      url = "https://whoknows.com/app/profiles/embed/" + result.data.d.results.Email;
			      console.log("navigating to: " + url);
			      displayFrame.slideDown();
			      displayFrame.attr("src", url);
			    },
			    {
			      AUTHORIZATION: 'OAUTH2',
			      OAUTH_SERVICE_NAME: 'gadgetOauth2SAMLBearerFlow',
			      CONTENT_TYPE: gadgets.io.ContentType.JSON
			    });
			}

			function makeOSAPIpeopleCall(){
				osapi.people.getOwner().execute(function(data) {
				    console.log(data.displayName);
				});
				/*osapi.people.getOwner().execute(function(data) {
				    document.getElementById("osapi").innerHTML += "<br>osapi.people.getOwner: " + data.displayName + ".<br>";
				});*/
			}

		    function init() {
		    	display.append(displayFrame);
				makeOSAPIpeopleCall();
		    	//makeODataCall();
			}

			init();
		}
    };
}();
