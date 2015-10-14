/*
License
Copyright 2014, SAP AG

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
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
					console.log("data.emails[0].value = " + data.emails[0].value);
					console.log("data.thumbnailUrl = " + data.thumbnailUrl);
					console.log("---------------------------------------------");
					
					if (!data.emails[0].value){
						url = "https://whoknows.com/app/profiles/embed/yourEmailAddress@whoknows.com";
					}
					else {
						url = "https://whoknows.com/app/profiles/embed/" + data.emails[0].value;
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
