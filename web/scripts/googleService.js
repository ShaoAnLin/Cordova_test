define('googleService', [], function() {
    var instance = {};

    instance.googleService = null;

    instance.init = function(map){
        console.log('init google service');
        var googleMap = new google.maps.Map(map, {
            center: new google.maps.LatLng(25,121),
            zoom: 15
        });
        this.googleService = new google.maps.places.PlacesService(googleMap);
    };

    instance.search = function(text){
        var request = {
            query: text,
            fields: ['formatted_address', 'name', 'geometry', 'place_id', 'plus_code'],
        };
        this.googleService.findPlaceFromQuery(request, function(result){
            console.log(result);
        });
    };

    return instance;
});