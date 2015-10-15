/*
License
Copyright 2014, SAP AG

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
function makeOSAPIpeopleCall(){

	osapi.people.getViewer().execute(function(data) {
		console.log(data);
		var osapiOutput = "";
		osapiOutput += "<p></p>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p><h2>osapi.people.getViewer</h2></p>";
		osapiOutput += "<ul>";
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
		osapiOutput += "<p></p>";
		$("body").append(osapiOutput);
	});

	osapi.people.getOwner().execute(function(data) {
		console.log(data);
		var osapiOutput = "";
		osapiOutput += "<p></p>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p><h2>osapi.people.getOwner</h2></p>";
		osapiOutput += "<ul>";
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
		osapiOutput += "<p></p>";
		$("body").append(osapiOutput);
	});

	osapi.people.getViewerFriends().execute(function(data) {
		console.log(data);
		var osapiOutput = "";
		osapiOutput += "<p></p>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p><h2>osapi.people.getViewerFriends:</h2></p>";
		osapiOutput += "<ul>";
		for (i = 0; i < data.list.length; i++) {
			osapiOutput += "<li>data.list[" + i + "].<b>id</b> = " + data.list[i].id + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>displayName</b> = " + data.list[i].displayName + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>givenName</b> = " + data.list[i].name.givenName + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>familyName</b> = " + data.list[i].name.familyName + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>formatted</b> = " + data.list[i].name.formatted + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>emails[0].type</b> = " + data.list[i].emails[0].type + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>emails[0].value</b> = " + data.list[i].emails[0].value + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>thumbnailUrl</b> = " + data.list[i].thumbnailUrl + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>photos[0].type</b> = " + data.list[i].photos[0].type + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>photos[0].value</b> = " + data.list[i].photos[0].value + "</li>";
		}
		osapiOutput += "</ul>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p></p>";
		$("body").append(osapiOutput);
	});

	osapi.people.getOwnerFriends().execute(function(data) {
		console.log(data);
		var osapiOutput = "";
		osapiOutput += "<p></p>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p><h2>osapi.people.getOwnerFriends:</h2></p>";
		osapiOutput += "<ul>";
		for (i = 0; i < data.totalResults; i++) {
			osapiOutput += "<li>data.list[" + i + "].<b>id</b> = " + data.list[i].id + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>displayName</b> = " + data.list[i].displayName + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>givenName</b> = " + data.list[i].name.givenName + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>familyName</b> = " + data.list[i].name.familyName + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>formatted</b> = " + data.list[i].name.formatted + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>emails[0].type</b> = " + data.list[i].emails[0].type + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>emails[0].value</b> = " + data.list[i].emails[0].value + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>thumbnailUrl</b> = " + data.list[i].thumbnailUrl + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>photos[0].type</b> = " + data.list[i].photos[0].type + "</li>";
			osapiOutput += "<li>data.list[" + i + "].<b>photos[0].value</b> = " + data.list[i].photos[0].value + "</li>";
		}
		osapiOutput += "</ul>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p></p>";
		$("body").append(osapiOutput);
	});

	osapi.people.getViewer().execute(function(dataForID) {
		osapi.people.get({"userId": dataForID.id}).execute(function(data) {
			console.log(data);
			var osapiOutput = "";
			osapiOutput += "<p></p>";
			osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
			osapiOutput += "<p><h2>osapi.people.get</h2></p>";
			osapiOutput += "<p><b>using the id from osapi.people.getViewer</b></p>";
			osapiOutput += "<p><b>osapi.people.getViewer.dataForID.<b>id</b> = " + dataForID.id + "</b></p>";
			osapiOutput += "<ul>";
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
			osapiOutput += "<p></p>";
			$("body").append(osapiOutput);
		});
	});
	
}

