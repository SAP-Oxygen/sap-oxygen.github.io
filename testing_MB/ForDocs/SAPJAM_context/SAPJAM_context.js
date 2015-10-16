/*
License
Copyright 2014, SAP AG

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
function make_SAPJAM_context_Call(){

	//osapi.people.get({"userId": dataForID.id}).execute(function(data) {
	gadgets.sapjam.context.get(function(context) {
		console.log(context);
		var osapiOutput = "";
		osapiOutput += "<p></p>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p><h2>gadgets.sapjam.context.get</h2></p>";
		/*osapiOutput += "<ul>";
		osapiOutput += "<li>data.<b>id</b> = " + data.id + "</li>";
		osapiOutput += "<li>data.<b>displayName</b> = " + data.displayName + "</li>";
		osapiOutput += "<li>data.<b>name.givenName</b> = " + data.name.givenName + "</li>";
		osapiOutput += "<li>data.<b>name.familyName</b> = " + data.name.familyName + "</li>";
		osapiOutput += "<li>data.<b>name.formatted</b> = " + data.name.formatted + "</li>";
		osapiOutput += "<li>data.<b>emails[0].type</b> = " + data.emails[0].type + "</li>";
		osapiOutput += "<li>data.<b>emails[0].value</b> = " + data.emails[0].value + "</li>";
		osapiOutput += "<li>data.<b>thumbnailUrl</b> = " + data.thumbnailUrl + "</li>";
		osapiOutput += "<li>data.<b>photos[0].type</b> = " + data.photos[0].type + "</li>";
		osapiOutput += "<li>data.<b>photos[0].value</b> = " + data.photos[0].value + "</li>";
		osapiOutput += "</ul>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p></p>";*/
		$("body").append(osapiOutput);
	});
	
}

