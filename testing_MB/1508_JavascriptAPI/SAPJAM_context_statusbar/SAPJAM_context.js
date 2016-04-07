/*
License
Copyright 2014, SAP AG

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
function make_SAPJAM_context_Call(){

	gadgets.sapjam.context.get(function(data) {
		console.log(JSON.stringify(data, null, 4));

		/* Begin HTML page */
		var osapiOutput = "";;
		osapiOutput += "gadgets.sapjam.context.get --> ";

		/* Adds all the properties of "gadgets.sapjam.context.get" with HTML formatting to a string (osapiOutput). */
		osapiOutput += "context = " + data.context;
		osapiOutput += ", id = " + data.id;
		osapiOutput += ", name = " + data.name;
		osapiOutput += ", readOnly = " + data.readOnly;

		/* End HTML page */
		osapiOutput += ". Open your browser console to view the raw JSON object.";

		/* Must show the following features:
			-> DONE - gadgets.sapjam.statusbar.show()
				-> show the current gadget if hidden
				-> Shows the contents (HTML body) of the statusbar gadget
				-> Shows the contents of the body element in the gadget
				-> Expands the gadget and shows the contents of the body element within it
			-> DONE - gadgets.sapjam.statusbar.hide()
				-> hide the current gadget if shown
				-> Hides the gadget
				-> Collapses the gadget
			-> DONE - gadgets.sapjam.statusbar.highlight()
				-> change the status bar section for the current gadget to a blue highlight and throb it 3 times
				-> Highlight the status bar and displays the string inside it (osapiOutput).
				-> Highlights the gadget in blue and makes it blink 3 times
			-> DONE - gadgets.sapjam.statusbar.clearHighlight()
				-> remove any blue highlighting on the status bar section for the current gadget
				-> 
			-> DONE - gadgets.sapjam.statusbar.setBadgeText(someString)
				-> add a red badge with the given string next to the gadget's title in the status bar section for the current gadget
				-> Adds a red badge with the given string to the left of the gadget's title in the status bar of the gadget
				-> Adds a red badge with text to the gadget
			-> DONE - gadgets.sapjam.statusbar.clearBadgeText()
				-> remove any red badge in the status bar section for the current gadget
				-> 
		*/

		/* Appends the string (osapiOutput) to the body of the HTML page. */
		$("body").append(osapiOutput);

		setTimeout(showStatusBar, 3000);
		setTimeout(clearBadgeText, 6000);
		setTimeout(hideStatusBar, 9000);
		setTimeout(clearBadgeText, 12000);
		setTimeout(clickToExpand, 15000);
		setTimeout(clearHighlight, 18000);
	});
	
}

function showStatusBar(){
	/* Highlights the gadget in blue and makes it blink 3 times */
	gadgets.sapjam.statusbar.highlight();

	/* Expands the gadget and shows the contents of the body element within it */
	gadgets.sapjam.statusbar.show();

	/* Adds a red badge with text to the gadget */
	gadgets.sapjam.statusbar.setBadgeText("Statusbar Expanded");
}

function clearBadgeText(){
	gadgets.sapjam.statusbar.clearBadgeText();
	gadgets.sapjam.statusbar.clearHighlight();
}

function hideStatusBar(){
	gadgets.sapjam.statusbar.hide();
	gadgets.sapjam.statusbar.highlight();
	gadgets.sapjam.statusbar.setBadgeText("Statusbar collapsed");
}

function clickToExpand(){
	gadgets.sapjam.statusbar.highlight();
	gadgets.sapjam.statusbar.setBadgeText("Click here");
}

function clearHighlight(){
	gadgets.sapjam.statusbar.clearHighlight();
}

