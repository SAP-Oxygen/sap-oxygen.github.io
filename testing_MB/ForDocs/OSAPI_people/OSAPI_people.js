
function makeOSAPIpeopleCall(){
	osapi.people.getViewer().execute(function(data) {
		var osapiOutput = "";
		osapiOutput += "<p></p>";
		osapiOutput += "<p>---------------------------------------------</p>";
		osapiOutput += "<p><b>osapi.people.getViewer:</b></p>";
		osapiOutput += "<p>---------------------------------------------</p>";
	    osapiOutput += "<p>displayName: " + data.displayName + ".</p>";
	    osapiOutput += "<p>name.givenName: " + data.name.givenName + ".</p>";
	    osapiOutput += "<p>name.familyName: " + data.name.familyName + ".</p>";
	    osapiOutput += "<p>name.formatted: " + data.name.formatted + ".</p>";
	    osapiOutput += "<p>emails[0].type: " + data.emails[0].type + ".</p>";
	    osapiOutput += "<p>emails[0].value: " + data.emails[0].value + ".</p>";
	    osapiOutput += "<p>thumbnailUrl: " + data.thumbnailUrl + ".</p>";
	    osapiOutput += "<p>photos[0].type: " + data.photos[0].type + ".</p>";
	    osapiOutput += "<p>photos[0].value: " + data.photos[0].value + ".</p>";
	    osapiOutput += "<p>---------------------------------------------</p>";
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

	osapi.people.getOwner().execute(function(data) {
		var osapiOutput = "";
	    osapiOutput += "<p>osapi.people.getOwner: " + data.displayName + ".</p>";
	    osapiOutput += "<p>osapi.people.getOwner: " + data.name.givenName + ".</p>";
	    osapiOutput += "<p>osapi.people.getOwner: " + data.name.familyName + ".</p>";
	    osapiOutput += "<p>osapi.people.getOwner: " + data.name.formatted + ".</p>";
	    osapiOutput += "<p>osapi.people.getOwner: " + data.emails[0].type + ".</p>";
	    osapiOutput += "<p>osapi.people.getOwner: " + data.emails[0].value + ".</p>";
	    osapiOutput += "<p>osapi.people.getOwner: " + data.thumbnailUrl + ".</p>";
	    osapiOutput += "<p>osapi.people.getOwner: " + data.photos[0].type + ".</p>";
	    osapiOutput += "<p>osapi.people.getOwner: " + data.photos[0].value + ".</p>";
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

