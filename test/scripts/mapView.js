define("mapView", [], function() {
    function MapView(){
        var self = this,
            map = null;
        self.init = function(){
            var mapOptions = {
			    zoomControl: false
		    };
			self.map = L.map('map', mapOptions).setView([25,121], 8);
			var roadMutant = L.gridLayer.googleMutant({
				maxZoom: 24,
				type:'roadmap'
            }).addTo(self.map);
            
            self.addSearchBox();

            self.map.on('click', function(e) {
                console.log("Click: " + e.latlng);
			    self.hideSearchResult();
            });

            // Test google search
            var directionsService = new google.maps.DirectionsService;
            directionsService.route({
                origin: "Taipei 101",
                destination: "基隆火車站",
                // origin: {lat: 25.033964, lng: 121.564215},
                // destination: {lat: 25.041845, lng: 121.557781},
                travelMode: 'TRANSIT'
            }, function(response, status) {
                if (status === 'OK') {
                    console.log(response);
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
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
        }
		
		self.searchPlace = function(keyword){
            var service = new google.maps.places.PlacesService();
            console.log(service);
            // service.nearbySearch({
            //     location: '-33.8670522,151.1957362',
            //     radius: 500,
            //     type: ['store']
            // }, self.searchDone);

			self.showSearchResult();
			$('#search-result-title').text(keyword);
        }

        self.searchDone = function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    console.log(results[i]);
                }
            }
        }
        
        self.showSearchResult = function(){
			$('#map').height('70%');
        }

        self.hideSearchResult = function(){
			$('#map').height('100%');
        }
    }
    return new MapView();
});