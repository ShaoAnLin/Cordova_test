define('googleSvc', [], function() {
    var instance = {};

    instance.googleService = null;
    instance.geocoder = null;

    instance.init = function(map){
        var googleMap = new google.maps.Map(map, {
            center: new google.maps.LatLng(25,121),
            zoom: 15
        });
        this.googleService = new google.maps.places.PlacesService(googleMap);
    };

    // Not used
    instance.searchByText = function(text){
        var request = {
            query: text,
            fields: ['formatted_address', 'name', 'geometry', 'place_id', 'plus_code'],
        };
        this.googleService.findPlaceFromQuery(request, function(result){
            console.log(result);
        });
    };

    instance.searchByLocations = function(locations, addresses, callback){
        if (locations.length == 0){
            callback(addresses);
            return;
        }

        if (!this.geocoder){
            this.geocoder = new google.maps.Geocoder;
        }

        var latlng = {lat: locations[0].lat(), lng: locations[0].lng()};
        locations.splice(0, 1);
        this.geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK && results[1]) {
                var request = {
                    placeId: results[1].place_id,
                    fields: ['address_components']
                };
                this.googleService.getDetails(request, function(result){
                    addresses.push(result.address_components);
                    this.searchByLocations(locations, addresses, callback);
                }.bind(this));
            }
        }.bind(this));
    };

    return instance;
});