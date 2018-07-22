define("mapView", [], function() {
    function MapView(){
        var self = this,
            map = null,
            routeOriginMarker = null,
            routeDestinationMarker = null,
            routeMode = false,
            routeOrigin = null,
            routeDestination = null;

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

            $('#navigate').on('click', function(){
				self.routeMode = true;
                $('#route-search').css('display', 'flex');
                $('#boxcontainer').hide();
				$('#route-destination-input').val($('#search-result-title').text());
                self.hideSearchResult();
				self.setRouteSearchBox();
				
				$('#route-origin-input').focus();
                
            	$('#route-search-back').on('click', function(){
                    self.routeMode = false;
            		self.showSearchResult();
                });

                $('#route-search-switch').on('click', function(){
                    var origin = $('#route-origin-input').val();
                    $('#route-origin-input').val($('#route-destination-input').val());
                    $('#route-destination-input').val(origin);
                });
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
                $('#searchboxinput').attr('placeholder', '輸入地點');
                var searchbox = new google.maps.places.SearchBox(this, {
                    bounds: self.getCurrentBound()
                });
                searchbox.addListener('places_changed', function() {
                    var places = this.getPlaces();
                    if (places.length > 0) {
                        console.log(places[0]);
                        self.searchDone(places[0]);
                    }
                });
            });
        }
		
		self.getCurrentBound = function(){
			var bounds = self.map.getBounds();
			return new google.maps.LatLngBounds(
				new google.maps.LatLng(bounds.getSouth(), bounds.getWest()),
				new google.maps.LatLng(bounds.getNorth(), bounds.getEast()));
		}

		self.setRouteSearchBox = function(){
			$('#route-origin-input').attr('placeholder', '輸入起點');
			$('#route-destination-input').attr('placeholder', '輸入終點');
			var option = {
                bounds: self.getCurrentBound()
            };
			var originSearchbox = new google.maps.places.SearchBox($('#route-origin-input')[0], option);
            var destinationSearchbox = new google.maps.places.SearchBox($('#route-destination-input')[0], option);

            originSearchbox.addListener('places_changed', function() {
                var places = this.getPlaces();
                if (places.length > 0) {
                    console.log(places[0]);
                    self.originSet(places[0]);
                }
            });
		}

		self.searchPlace = function(keyword){
            if (keyword != ''){
                self.showSearchResult();
            }
        }

        self.searchDone = function(place) {
            if (typeof(place.geometry) != "undefined"){
                self.routeDestination = place;
                var location = place.geometry.location,
                    bounds = self.getPlaceBound(place);
                
                var popup = self.getPopupDiv(place.icon, place.name);
                self.routeDestinationMarker = L.marker([location.lat(), location.lng()], {icon: self.getIcon('red')})
                    .bindPopup(popup, {minWidth : 100})
                    .on('popupopen', function (popup) {
						if (!self.routeMode){
							self.showSearchResult();
						}
                    });
                self.routeDestinationMarker.addTo(self.map);
                self.routeDestinationMarker.openPopup();
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

        self.getPlaceBound = function(place){
            var viewport = place.geometry.viewport;
            return L.latLngBounds(L.latLng(viewport.f.b, viewport.b.b),
                                  L.latLng(viewport.f.f, viewport.b.f));
        }
        
        self.showSearchResult = function(){
			$('#map').height('80%');
			$('#route-search').hide();
			$('#boxcontainer').show();
			$('#searchboxinput').val($('#search-result-title').text());
        }

        self.hideSearchResult = function(){
            $('#map').height('100%');
            $('#searchboxinput').val('');
            if (self.routeDestinationMarker && !self.routeMode){
                self.routeDestinationMarker.remove();
            }
            $('#searchboxinput').attr('placeholder', '');
        }

        self.originSet = function(place){
            self.routeOrigin = place;
            var location = place.geometry.location,
                popup = self.getPopupDiv(place.icon, place.name);
            self.routeOriginMarker = L.marker([location.lat(), location.lng()], {icon: self.getIcon('green')})
                .bindPopup(popup, {minWidth : 100})
                .on('popupopen', function (popup) {
                    console.log('origin!');
            });;
            self.routeOriginMarker.addTo(self.map).openPopup();
            self.setRouteViewport();
        }

        self.setRouteViewport = function(){
            var bound = self.getPlaceBound(self.routeOrigin);
            var newBound = self.map.getBounds().extend(bound);
            self.map.fitBounds(newBound);
        }

        self.getPopupDiv = function(icon, name){
            return "<img src='" + icon + "' style='width: 20px; float: left; padding-right: 10px'/><span style='font-size: 14px'>"
                + name + "</span>";
        }

        self.getIcon = function(color){
            return L.icon({
                iconUrl: 'css/images/marker-' + color + '.svg',
                iconSize: [30, 40],
                popupAnchor: [0, -10],
                shadowAnchor: [12, 20],
                shadowUrl: 'css/images/marker-shadow.png',
            });
        }
    }
    return new MapView();
});