requirejs.config({
    paths: {
        async: 'lib/async',
        app: 'scripts'
    },
    shim: {
        'mapView': [
            'lib/leaflet',
            'lib/leaflet-customer-searchbox',
            'lib/Leaflet.GoogleMutant',
            'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyC4BOUHAJHQLFcg4OPRvvF3SeTsGThYZZs&libraries=geometry,places'],
        'lib/Leaflet.GoogleMutant': [
            'lib/jquery-3.3.1.min',
            'lib/jquery-ui.min']
    }
});

define(['mapView'], function (mapView) {
    mapView.init();
});