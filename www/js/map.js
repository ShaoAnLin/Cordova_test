var map = new L.Map('map', {center: new L.LatLng(25.034, 121.564), zoom: 12});
var googleLayer = new L.Google('ROADMAP');
map.addLayer(googleLayer);