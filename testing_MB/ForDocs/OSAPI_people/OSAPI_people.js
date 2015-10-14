
function makeOSAPIpeopleCall(){
	osapi.people.getViewer().execute(function(data) {
		var osapiOutput = "";
		osapiOutput += "<p></p>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p><h2>osapi.people.getViewer</h2></p>";
		osapiOutput += "<ul>";
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
		var osapiOutput = "";
		osapiOutput += "<p></p>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p><h2>osapi.people.getOwner</h2></p>";
		osapiOutput += "<ul>";
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
	    osapiOutput += "<p>osapi.people.getViewerFriends:</p>";
	    for (i = 0; i < data.totalResults; i++) {
	        osapiOutput += "<p>" + data.list[i].displayName + ".</p>";
	        osapiOutput += "<p>" + data.list[i].name.givenName + ".</p>";
	        osapiOutput += "<p>" + data.list[i].name.familyName + ".</p>";
	        osapiOutput += "<p>" + data.list[i].name.formatted + ".</p>";
	        osapiOutput += "<p>" + data.list[i].emails[0].type + ".</p>";
	        osapiOutput += "<p>" + data.list[i].emails[0].value + ".</p>";
	        osapiOutput += "<p>" + data.list[i].thumbnailUrl + ".</p>";
	        osapiOutput += "<p>" + data.list[i].photos[0].type + ".</p>";
	        osapiOutput += "<p>" + data.list[i].photos[0].value + ".</p>";
	    }
	    $("body").append(osapiOutput);
	});

	osapi.people.getOwnerFriends().execute(function(data) {
		var osapiOutput = "";
	    osapiOutput += "osapi.people.getOwnerFriends: ";
	    for (i = 0; i < data.totalResults; i++) {
	        osapiOutput += "<p>" + data.list[i].displayName + ".</p>";
	        osapiOutput += "<p>" + data.list[i].name.givenName + ".</p>";
	        osapiOutput += "<p>" + data.list[i].name.familyName + ".</p>";
	        osapiOutput += "<p>" + data.list[i].name.formatted + ".</p>";
	        osapiOutput += "<p>" + data.list[i].emails[0].type + ".</p>";
	        osapiOutput += "<p>" + data.list[i].emails[0].value + ".</p>";
	        osapiOutput += "<p>" + data.list[i].thumbnailUrl + ".</p>";
	        osapiOutput += "<p>" + data.list[i].photos[0].type + ".</p>";
	        osapiOutput += "<p>" + data.list[i].photos[0].value + ".</p>";
	    }
	    $("body").append(osapiOutput);
	});
/*
	osapi.people.get({
	    "userId": "UUID_HERE"}).execute(function(data) {
	    	var osapiOutput = "";
			osapiOutput += "<p>osapi.people.get(): " + data.displayName + ".</p>";
			osapiOutput += "<p>osapi.people.get(): " + data.name.givenName + ".</p>";
			osapiOutput += "<p>osapi.people.get(): " + data.name.familyName + ".</p>";
			osapiOutput += "<p>osapi.people.get(): " + data.name.formatted + ".</p>";
			osapiOutput += "<p>osapi.people.get(): " + data.emails[0].type + ".</p>";
			osapiOutput += "<p>osapi.people.get(): " + data.emails[0].value + ".</p>";
			osapiOutput += "<p>osapi.people.get(): " + data.thumbnailUrl + ".</p>";
			osapiOutput += "<p>osapi.people.get(): " + data.photos[0].type + ".</p>";
			osapiOutput += "<p>osapi.people.get(): " + data.photos[0].value + ".</p>";
			$("body").append(osapiOutput);
		}
	});
	*/
}

