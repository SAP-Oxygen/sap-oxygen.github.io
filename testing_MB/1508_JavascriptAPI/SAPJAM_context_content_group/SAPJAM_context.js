/*
License
Copyright 2014, SAP AG

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
function make_SAPJAM_context_Call(){
	/*
	Display all of the properties for "gadgets.sapjam.context.get" in a HTML page.
	*/

	gadgets.sapjam.context.get(function(data) {
		console.log(data);
		console.log(JSON.stringify(data));

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
		
		/* Adds group context object properties to the string (osapiOutput) if the gadget has a content or group context. */
		osapiOutput += "<li>Group Context Object:<ul>";
		if (data.context != "preview") {
			osapiOutput += "<li>data.<b>group.id</b> = " + data.group.id + "</li>";
			osapiOutput += "<li>data.<b>group.name</b> = " + data.group.name + "</li>";
		}
		else {
			osapiOutput += "<li>Group Context Object not available. This gadget must be added to a group to have a Group Context Object.</li>";
		}
		osapiOutput += "</ul></li>";
		
		osapiOutput += "<li>Raw JSON:<ul>";
		osapiOutput += "<li>" + JSON.stringify(data) + "</li></ul></li>";

		/* End HTML page */
		osapiOutput += "</ul>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";

		/* Displays the string (osapiOutput). */
		$("body").append(osapiOutput);
	});
	
}

