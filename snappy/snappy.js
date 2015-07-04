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

  gadgets.window.adjustHeight();
}

gadgets.util.registerOnLoadHandler(initialize);