requirejs.config({
    paths: {
        app: "scripts"
    },
    shim: {
        'mapView': [
            'lib/leaflet',
            'lib/leaflet-customer-searchbox',
            'lib/Leaflet.GoogleMutant'],
        'lib/leaflet-customer-searchbox': ['lib/leaflet'],
        'lib/Leaflet.GoogleMutant': [
            'lib/leaflet',
            'lib/jquery-3.3.1.min',
            'lib/jquery-ui.min']
    }
});

define(['mapView'], function (mapView) {
    mapView.init();
});