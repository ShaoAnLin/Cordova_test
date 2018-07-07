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
			control._searchfunctionCallBack = function (searchkeywords)
			{
				if (!searchkeywords) {
					searchkeywords = "The search call back is clicked !!"
				}
				alert(searchkeywords);
			}
            self.map.addControl(control);
        }
    }
    return new MapView();
});