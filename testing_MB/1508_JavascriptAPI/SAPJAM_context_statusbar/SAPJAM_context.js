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
		var osapiOutput = "";
		osapiOutput += "<p></p>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p><h2>gadgets.sapjam.context.get</h2></p>";
		osapiOutput += "<ul>";

		/* Adds all the properties of "gadgets.sapjam.context.get" with HTML formatting to a string (osapiOutput). */
		osapiOutput += "<li>data.<b>context</b> = " + data.context + "</li>";
		osapiOutput += "<li>data.<b>id</b> = " + data.id + "</li>";
		osapiOutput += "<li>data.<b>name</b> = " + data.name + "</li>";
		osapiOutput += "<li>data.<b>readOnly</b> = " + data.readOnly + "</li>";

		/* End HTML page */
		osapiOutput += "<li>Open your browser console to view the raw JSON object.</li>";
		osapiOutput += "</ul>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p></p>";

		/* Highlight the status bar and displays the string inside it (osapiOutput). */
		gadgets.sapjam.statusbar.highlight();
		gadgets.sapjam.statusbar.setBadgeText(osapiOutput);

		/* Instructs the user how to use the statusbar gadget */
		$("body").append("<p>Click on the statusbar gadget on the bottom of the screen to display <h2>gadgets.sapjam.context.get</h2> properties.</p>");
	});
	
}

