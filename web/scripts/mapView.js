define("mapView", ['util'], function(util) {
    function MapView(){
        var self = this,
            map = null,
            locateMe = null,
            routeMode = false,
            routeOriginMarker = null,
            routeDestinationMarker = null,
            routeOrigin = null,
            routeDestination = null,
			routePolylines = [];

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

            self.locateMe = L.control.location({position: 'bottomright'});
            self.locateMe.addTo(self.map);

            self.addSearchBox();
            self.eventBinding();
        }
        
        self.eventBinding = function(){
            self.map.on('click', function(e) {
                console.log("Click: {0}".format(e.latlng));
				if (!self.routeMode){
					self.hideSearchResult();
				}
            });
            
            $('#navigate').on('click', function(){
				self.routeMode = true;
                $('#route-search').css('display', 'flex');
                $('#boxcontainer').hide();
                $('#route-destination-input').val($('#search-result-title').text());
                $('#route-origin-input').focus();
                self.hideSearchResult();
				self.setRouteSearchBox();
                self.routeDestinationMarker.closePopup();
                self.locateMe.remove();
            });
            
        	$('#route-search-back').on('click', function(){
                self.routeMode = false;
                self.showSearchResult();
                self.locateMe.addTo(self.map);
                $('#route-origin-input').val('');
				self.clearRouteResult();
            });

            $('#route-search-switch').on('click', function(e){
                var originText = $('#route-origin-input').val(),
                    originPlace = self.routeOrigin,
                    originMarker = self.routeOriginMarker;

                $('#route-origin-input').val($('#route-destination-input').val());
                self.routeOrigin = self.routeDestination;
                if (self.routeDestinationMarker){
                    self.routeDestinationMarker.setIcon(util.getIcon('green'));
                }
                self.routeOriginMarker = self.routeDestinationMarker;

                $('#route-destination-input').val(originText);
                self.routeDestination = originPlace;
                if (originMarker){
                    originMarker.setIcon(util.getIcon('red'));
                }
                self.routeDestinationMarker = originMarker;
				
				if (self.routeOrigin && self.routeDestination){
					self.clearRouteResult();
					self.searchRouteAndUpdateView();
				}
            });
            
            // TODO: Show the button only if the input text is not empty
            //       Add the clear funtion in searchbox
            $('#route-origin-clear').on('click', function(){
                $('#route-origin-input').val('');
                $('#route-origin-input').focus();
                self.routeOrigin = null;
                if (self.routeOriginMarker){
                    self.routeOriginMarker.remove();
                    self.routeOriginMarker = null;
                }
				self.clearRouteResult();
            });
            
            $('#route-destination-clear').on('click', function(){
                $('#route-destination-input').val('');
                $('#route-destination-input').focus();
                self.routeDestination = null;
                if (self.routeDestinationMarker){
                    self.routeDestinationMarker.remove();
                    self.routeDestinationMarker = null;
                }
				self.clearRouteResult();
            });
        }

        self.addSearchBox = function(){
			var searchboxControl = createSearchboxControl();
			var control = new searchboxControl();
			control._searchfunctionCallBack = self.searchPlace;
            self.map.addControl(control);

            $('#boxcontainer').width('{0}px'.format($(window).width() - 170));
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
            destinationSearchbox.addListener('places_changed', function() {
                var places = this.getPlaces();
                if (places.length > 0) {
                    console.log(places[0]);
                    self.destinationSet(places[0]);
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
                
                var popup = util.getPopupDiv(place.icon, place.name);
                self.routeDestinationMarker = L.marker([location.lat(), location.lng()], {icon: util.getIcon('red')})
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
            $('#route-search').hide();
            $('#boxcontainer').show();
			$('#search-result').css('display', 'flex');
            if (self.routeDestinationMarker){
                $('#map').height('calc(100% - 140px)');
                $('#searchboxinput').val($('#search-result-title').text());
            }
            else{
                $('#map').height('100%');
            }
            if (self.routeOriginMarker){
                self.routeOriginMarker.remove();
                self.routeOriginMarker = null;
            }
        }

        self.hideSearchResult = function(){
            if (self.routeMode){
                $('#map').height('calc(100% - 120px)');
            }
            else{
                $('#map').height('100%');
            }
			$('#search-result').hide();
            $('#searchboxinput').val('');
            $('#searchboxinput').attr('placeholder', '');
            if (!self.routeMode){
	            self.routeDestination = null;
	            if (self.routeDestinationMarker){
	                self.routeDestinationMarker.remove();
	                self.routeDestinationMarker = null;
	            }
        	}
        }

        self.originSet = function(place){
            self.routeOrigin = place;
            var location = place.geometry.location,
                popup = util.getPopupDiv(place.icon, place.name);
            self.routeOriginMarker = L.marker([location.lat(), location.lng()], {icon: util.getIcon('green')})
                .bindPopup(popup, {minWidth : 100})
                .on('popupopen', function (popup) {
                    console.log('origin!');
            });;
            self.routeOriginMarker.addTo(self.map);
            self.searchRouteAndUpdateView();
        }

        self.destinationSet = function(place){
            self.routeDestination = place;
            var location = place.geometry.location,
                popup = util.getPopupDiv(place.icon, place.name);
            self.routeDestinationMarker = L.marker([location.lat(), location.lng()], {icon: util.getIcon('red')})
                .bindPopup(popup, {minWidth : 100})
                .on('popupopen', function (popup) {
                    console.log('desination!');
            });;
            self.routeDestinationMarker.addTo(self.map);
            self.searchRouteAndUpdateView();
        }

        self.searchRouteAndUpdateView = function(){
            var points = [],
            	originLocation = null,
            	destinationLocation = null;
            if (self.routeOrigin){
                originLocation = self.routeOrigin.geometry.location;
                points.push(new L.LatLng(originLocation.lat(), originLocation.lng()));
            }
            if (self.routeDestination){
                destinationLocation = self.routeDestination.geometry.location;
                points.push(new L.LatLng(destinationLocation.lat(), destinationLocation.lng()));
            }
            if (points.length == 2){
                self.map.fitBounds(new L.LatLngBounds(points), {padding: [5, 5]});
                
	            var directionsService = new google.maps.DirectionsService;
	            directionsService.route({
	            	origin: {lat: originLocation.lat(), lng: originLocation.lng()},
	                destination: {lat: destinationLocation.lat(), lng: destinationLocation.lng()},
	                travelMode: 'TRANSIT'
	            }, function(response, status) {
	                if (status === 'OK') {
                        self.routeSearchDone(response);
	                } else {
	                    window.alert('Directions request failed due to ' + status);
	                }
	            });
            }
            else if (points.length == 1){
                var place = self.routeOrigin ? self.routeOrigin : self.routeDestination;
                self.map.fitBounds(self.getPlaceBound(place));
            }
        }

        self.routeSearchDone = function(response){
            // TODO: (1) Add markers between two transition?
            //       (2) Show more results
            //       (3) Show detail result
            console.log(response);
            self.routePolylines = [];
            var steps = response.routes[0].legs[0].steps,
                duration = response.routes[0].legs[0].duration.text,
                routeBriefHtml = '';
            for (var i = 0; i < steps.length; ++i){
                var mode = steps[i].travel_mode,
                    transitMode = mode;
                if (steps.length > 7 && mode == 'WALKING'){
                    continue;
                }
                if (self.routePolylines.length > 0){
                    routeBriefHtml += util.getIconHtml('RIGHT');
                }
                if (mode == 'TRANSIT'){
                    console.log(steps[i].transit.line.vehicle.type);
                    transitMode = steps[i].transit.line.vehicle.type;
                }

                routeBriefHtml += util.getIconHtml(transitMode);
                if (mode == 'TRANSIT'){
                    var shortName = steps[i].transit.line.short_name;
                    routeBriefHtml += util.getTransitNameHtml(shortName);
                }

                var points = steps[i].polyline.points;
                var polyline = L.Polyline.fromEncoded(points, util.getLineStyle(transitMode));
                polyline.addTo(self.map);
                self.routePolylines.push(polyline);
            }
            self.showRouteBrief(routeBriefHtml);
            if ($('#route-brief-result')[0].scrollHeight > 50){
                $('.transit-name').hide();
            } else {
                $('.transit-name').show();
            }
            $('#route-brief-duration').text(duration);
        }

		self.clearRouteResult = function(){
			if (self.routePolylines){
				self.routePolylines.forEach(function(polyline){
					polyline.remove();
				});
			}
			self.routePolylines = [];
			$('#route-brief-container').hide();
			if (self.routeMode){
				$('#map').height('calc(100% - 120px)');
			}
		}
		
		self.showRouteBrief = function(innerHtml){
			$('#map').height('calc(100% - 170px)');
			$('#route-brief-result').html(innerHtml);
			$('#route-brief-container').show();
		}
    }
    return new MapView();
});