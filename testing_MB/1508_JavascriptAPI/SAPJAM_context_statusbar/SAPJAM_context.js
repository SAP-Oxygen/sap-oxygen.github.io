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
		osapiOutput += "--------------------------------";
		osapiOutput += "gadgets.sapjam.context.get";

		/* Adds all the properties of "gadgets.sapjam.context.get" with HTML formatting to a string (osapiOutput). */
		osapiOutput += "data.context = " + data.context;
		osapiOutput += "data.id = " + data.id;
		osapiOutput += "data.name = " + data.name;
		osapiOutput += "data.readOnly = " + data.readOnly;

		/* End HTML page */
		osapiOutput += "Open your browser console to view the raw JSON object.";
		osapiOutput += "--------------------------------";

		/* Highlight the status bar and displays the string inside it (osapiOutput). */
		gadgets.sapjam.statusbar.highlight();
		gadgets.sapjam.statusbar.setBadgeText("Click here");

		/* Instructs the user how to use the statusbar gadget */
		$("body").append(osapiOutput);
	});
	
}

