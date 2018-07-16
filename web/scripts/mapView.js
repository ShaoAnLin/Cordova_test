define("mapView", [], function() {
    function MapView(){
        var self = this,
            map = null,
            searchbox = null,
            searchMarker = null;

        self.init = function(){
            var mapOptions = {
			    zoomControl: false
		    };
			self.map = L.map('map', mapOptions).setView([25.0879,121.5858], 10);
			L.gridLayer.googleMutant({
                minZoom: 3,
				maxZoom: 24,
				type:'roadmap'
            }).addTo(self.map);
            
            self.addSearchBox();

            self.map.on('click', function(e) {
                console.log("Click: " + e.latlng);
			    self.hideSearchResult();
            });

            L.control.location({position: 'bottomright'}).addTo(self.map);

            // Test google search
            // var directionsService = new google.maps.DirectionsService;
            // directionsService.route({
            //     origin: "Taipei 101",
            //     destination: "基隆火車站",
            //     // origin: {lat: 25.033964, lng: 121.564215},
            //     // destination: {lat: 25.041845, lng: 121.557781},
            //     travelMode: 'TRANSIT'
            // }, function(response, status) {
            //     if (status === 'OK') {
            //         console.log(response);
            //     } else {
            //         window.alert('Directions request failed due to ' + status);
            //     }
            // });
        }

        self.addSearchBox = function(){
			var searchboxControl = createSearchboxControl();
			var control = new searchboxControl();
			control._searchfunctionCallBack = self.searchPlace;
            self.map.addControl(control);

            $('#boxcontainer').width($(window).width() - 170 + 'px');
            $('#searchboxinput').focus(function(){
                // Use google searchbox
                $('#searchboxinput').attr('placeholder', '輸入地點');
                var bounds = self.map.getBounds();
                var currentBound = new google.maps.LatLngBounds(
                    new google.maps.LatLng(bounds.getSouth(), bounds.getWest()),
                    new google.maps.LatLng(bounds.getNorth(), bounds.getEast()));

                if (self.searchbox == null){
                    self.searchbox = new google.maps.places.SearchBox(this, {
                        bounds: currentBound
                    });
                }
                self.searchbox.addListener('places_changed', function() {
                    var places = self.searchbox.getPlaces();
                    if (places.length > 0) {
                        console.log(places[0]);
                        self.searchDone(places[0]);
                    }
                });
            });

            $('#navigate').on('click', function(){
                console.log("navigate");
                $('#route-search').css('display', 'flex');
                $('#boxcontainer').hide();
                self.hideSearchResult();
            });
        }
		
		self.searchPlace = function(keyword){
            if (keyword != ''){
                self.showSearchResult();
            }
        }

        self.searchDone = function(place) {
            if (typeof(place.geometry) != "undefined"){
                var viewport = place.geometry.viewport,
                    location = place.geometry.location,
                    bounds = L.latLngBounds(
                        L.latLng(viewport.f.b, viewport.b.b), 
                        L.latLng(viewport.f.f, viewport.b.f));
                
                var popup = "<img src='" + place.icon + "' style='width: 20px; float: left; padding-right: 10px'/><span style='font-size: 14px'>"
                    + place.name + "</span>";
                self.searchMarker = L.marker([location.lat(), location.lng()])
                    .bindPopup(popup, {minWidth : 100})
                    .on('popupopen', function (popup) {
                        self.showSearchResult();
                    });;
                self.searchMarker.addTo(self.map);
                self.searchMarker.openPopup();
                self.map.fitBounds(bounds);
            }
            $('#search-result-title').text(place.name);
            if (typeof(place.opening_hours) != "undefined"){
                $('#search-result-open').text(place.opening_hours.open_now
                    ? "營業中" : "休息中");
            }
            if (typeof(place.rating) != "undefined"){
                $('#search-result-rating-star').show();
            }
            $('#search-result-rating-val').text(place.rating);
            $('#search-result-address').text(place.formatted_address);
            $('#search-result-phone-number').text(place.formatted_phone_number);
            if (typeof(place.formatted_phone_number) != "undefined"){
                $('#search-result-phone-icon').show();
            }
            self.showSearchResult();
        }
        
        self.showSearchResult = function(){
			$('#map').height('80%');
        }

        self.hideSearchResult = function(){
            $('#map').height('100%');
            $('#searchboxinput').val('');
            if (self.searchMarker){
                self.searchMarker.remove();
            }
            $('#searchboxinput').attr('placeholder', '');
        }
    }
    return new MapView();
});