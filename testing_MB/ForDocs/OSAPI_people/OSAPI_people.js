

function appendText() {
	var txt1 = "<p>Logging everything from osapi.people.getOwner</p>";
	txt1 += "<p>---------------------------------------------</p>";
	$("body").append(txt1);
}

function makeOSAPIownerCALL(){
	osapi.people.getOwner().execute(function(data) {
		var osapiOutput = "<p>Logging everything from osapi.people.getOwner</p>";
		osapiOutput += "<p>---------------------------------------------</p>";
		osapiOutput += "<p>data = + data</p>";
		osapiOutput += "<p>data.id = + data.id</p>";
		osapiOutput += "<p>data.displayName = + data.displayName</p>";
		osapiOutput += "<p>data.givenName = + data.givenName</p>";
		osapiOutput += "<p>data.familyName = + data.familyName</p>";
		osapiOutput += "<p>data.nickname = + data.nickname</p>";
		osapiOutput += "<p>data.email = + data.email</p>";
		osapiOutput += "<p>data.thumbnailUrl = + data.thumbnailUrl</p>";
		$("body").append(osapiOutput);
	});
}

function makeOSAPIpeopleCall(){
	osapi.people.getViewer().execute(function(data) {
		var osapiOutput = "";
	    osapiOutput += "<p>osapi.people.getViewer: " + data.displayName + ".</p>";
	    osapiOutput += "<p>osapi.people.getViewer: " + data.name.givenName + ".</p>";
	    osapiOutput += "<p>osapi.people.getViewer: " + data.name.familyName + ".</p>";
	    osapiOutput += "<p>osapi.people.getViewer: " + data.name.formatted + ".</p>";
	    osapiOutput += "<p>osapi.people.getViewer: " + data.emails[0].type + ".</p>";
	    osapiOutput += "<p>osapi.people.getViewer: " + data.emails[0].value + ".</p>";
	    osapiOutput += "<p>osapi.people.getViewer: " + data.thumbnailUrl + ".</p>";
	    osapiOutput += "<p>osapi.people.getViewer: " + data.photos[0].type + ".</p>";
	    osapiOutput += "<p>osapi.people.getViewer: " + data.photos[0].value + ".</p>";
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

