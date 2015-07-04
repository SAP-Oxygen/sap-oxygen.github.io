function initialize() {
  var fenway = new google.maps.LatLng(42.345573, -71.098326);
  var mapOptions = {
    center: fenway,
    zoom: 14
  };
  var map = new google.maps.Map(
      document.getElementById('map-canvas'), mapOptions);
  var panoramaOptions = {
    position: fenway,
    pov: {
      heading: 34,
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
  });

  gadgets.window.adjustHeight();
}

gadgets.util.registerOnLoadHandler(initialize);