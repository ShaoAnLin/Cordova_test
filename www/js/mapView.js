define("mapView",
    //["leaflet", "leaflet-google"], function() {
    [], function(){
    function MapView() {
        console.log("in MapView");

        var self = this;

        self.init = function (){
            console.log("map init");
            // var map = new L.Map('map', {center: new L.LatLng(25.034, 121.564), zoom: 12});
            // var googleLayer = new L.Google('ROADMAP');
            // map.addLayer(googleLayer);
        }
    }
    return new MapView();
});
