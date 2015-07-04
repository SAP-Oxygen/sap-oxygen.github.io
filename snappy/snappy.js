function initialize() {
  var startPos = new google.maps.LatLng(42.345573, -71.098326);
  var mapOptions = {
    center: startPos,
    zoom: 14
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var panoramaOptions = {
    position: startPos
  };
  var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
  map.setStreetView(panorama);

  var searchBoxElement = document.getElementById('search-box');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBoxElement);
  var searchBox = new google.maps.places.SearchBox(searchBoxElement);

  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
        return;
    }

    var pos = places[0].geometry.location;
    map.setCenter(pos);
    panorama.setPosition(pos);
  });

  gadgets.window.adjustHeight();

  var geocoder = new google.maps.Geocoder();

  $('#save-button').click(function() {
    var comment = $.trim($('#save-comment').val());
    var pos = panorama.getPosition();
    var zoom = map.getZoom();
    var pov = panorama.getPov();
   
    var mapImageURL = "https://maps.googleapis.com/maps/api/staticmap?size=400x200&markers=color:green|" + pos.toUrlValue() + "&center=" + pos.toUrlValue() + "&zoom=" + zoom;
    var streetViewImageURL = "https://maps.googleapis.com/maps/api/streetview?size=400x200&fov=90&location=" + pos.toUrlValue() + "&heading=" + pov.heading + "&pitch=" + pov.pitch;

    geocoder.geocode({'latLng': pos}, function(results, status) {
      var placeName;
      if (status == google.maps.GeocoderStatus.OK && results[1]) {
        placeName = results[1].formatted_address;
      } else {
        placeName = pos.toString();
      }

      osapi.activitystreams.create({
        activity: {
          title: "#{savePlace}",
          content: "#{savePlaceContent}",
          object: {
            displayName: placeName,
            id: pos.toString(),
            attachments: [
              {displayName: comment},
              {displayName: mapImageURL},
              {displayName: streetViewImageURL}
            ]
          }
        }
      }).execute(function (result) {});
    });
  });
}

gadgets.util.registerOnLoadHandler(initialize);