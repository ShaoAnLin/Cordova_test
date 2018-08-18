requirejs.config({
    paths: {
        async: 'lib/async',
        app: 'scripts'
    },
    shim: {
        'lib/Polyline.encoded': ['lib/leaflet'],
        'lib/leaflet-location': ['lib/leaflet'],
        'lib/Leaflet.GoogleMutant': [
            'lib/jquery-3.3.1.min',
            'lib/jquery-ui.min'],
        'mapView': [
            'lib/leaflet',
            'lib/leaflet-location',
            'lib/leaflet-customer-searchbox',
            'lib/Leaflet.GoogleMutant',
            'lib/Polyline.encoded',
            'lib/JavascriptStrings',
            'lib/Toast.min',
            'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyC4BOUHAJHQLFcg4OPRvvF3SeTsGThYZZs&libraries=geometry,places'],
        'util': ['lib/JavascriptStrings']
    }
});

define(['mapView'], function (mapView) {
    mapView.init();
});