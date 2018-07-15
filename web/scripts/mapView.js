define("mapView", [], function() {
    function MapView(){
        var self = this,
            map = null,
            searchbox = null;

        self.init = function(){
            var mapOptions = {
			    zoomControl: false
		    };
			self.map = L.map('map', mapOptions).setView([25,121], 8);
			L.gridLayer.googleMutant({
				maxZoom: 24,
				type:'roadmap'
            }).addTo(self.map);
            
            self.addSearchBox();

            self.map.on('click', function(e) {
                console.log("Click: " + e.latlng);
			    self.hideSearchResult();
            });
            
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
			var control = new searchboxControl({
				sidebarTitleText: 'Header',
				sidebarMenuItems: {
					Items: [
						{ type: "link", name: "Link 1 (github.com)", href: "http://github.com", icon: "icon-local-carwash" },
						{ type: "link", name: "Link 2 (google.com)", href: "http://google.com", icon: "icon-cloudy" },
						{ type: "button", name: "Button 1", onclick: "alert('button 1 clicked !')", icon: "icon-potrait" },
						{ type: "button", name: "Button 2", onclick: "button2_click();", icon: "icon-local-dining" },
						{ type: "link", name: "Link 3 (stackoverflow.com)", href: 'http://stackoverflow.com', icon: "icon-bike" },
					]
				}
			});
			control._searchfunctionCallBack = self.searchPlace;
            self.map.addControl(control);

            $('#searchboxinput').focus(function(){
                // Use google searchbox
                var bounds = self.map.getBounds();
                var currentBound = new google.maps.LatLngBounds(
                    new google.maps.LatLng(bounds.getSouth(), bounds.getWest()),
                    new google.maps.LatLng(bounds.getNorth(), bounds.getEast()));
                console.log(currentBound);

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
        }
		
		self.searchPlace = function(keyword){
			self.showSearchResult();
			$('#search-result-title').text(keyword);
        }

        self.searchDone = function(place) {
            if (typeof(place.geometry) != "undefined"){
                var viewport = place.geometry.viewport,
                    location = place.geometry.location,
                    bounds = L.latLngBounds(
                        L.latLng(viewport.f.b, viewport.b.b), 
                        L.latLng(viewport.f.f, viewport.b.f));

                var marker = L.marker([location.lat(), location.lng()]);
                marker.addTo(self.map);
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
        }
    }
    return new MapView();
});