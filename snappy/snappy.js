function initialize() {
  var currentPosition = new google.maps.LatLng(42.345573, -71.098326);
  var mapOptions = {
    center: currentPosition,
    zoom: 14
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var panoramaOptions = {
    position: currentPosition,
    pov: {
      pitch: 10
    }
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
    map.setStreetView(panorama);
  });

  gadgets.window.adjustHeight();
}

gadgets.util.registerOnLoadHandler(initialize);