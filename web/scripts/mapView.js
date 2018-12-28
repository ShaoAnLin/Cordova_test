define("mapView", ['util', 'transportSvc', 'googleSvc'],
	function(util, transportSvc, googleSvc) {
	function MapView(){
		var self = this,
			map = null,
			locateMe = null,
			VIEW_MODE = {'Search': 0, 'Route': 1, 'Detail': 2, 'Info': 3},
			viewMode = VIEW_MODE.Search,
			routeOrigin = null,
			routeOriginMarker = null,

			// === Route view === //
			routeDestination = null,
			routeDestinationMarker = null,
			routeBound = null,
			routePolylines = [],
			transitMarkers = [],

			// === Detail view === //
			transitIdMap = [],
			stepDetails = [],
			routeSummary = null,

			// === Info view === ///
			transitIdx = null,
			routeStopList = [],
			routeStopMarkers = [],
			routeInfoIdxList = [];
			currentStops = [];

		self.init = function(){
			var mapOptions = {
				zoomControl: false
			};
			self.map = L.map('map', mapOptions).setView([25.0595, 121.5515], 12);
			L.gridLayer.googleMutant({
				minZoom: 3,
				maxZoom: 22,
				type:'roadmap'
			}).addTo(self.map);

			self.locateMe = L.control.location({position: 'bottomright'});
			self.locateMe.addTo(self.map);

			self.addSearchBox();
			self.eventBinding();
			
			googleSvc.init(document.getElementById('google-map'));
		}

		self.eventBinding = function(){
			self.map.on('click', function(e) {
				console.log("Click: {0}, zoom: {1}".format(e.latlng, self.map.getZoom()));
				if (self.viewMode === VIEW_MODE.Search){
					self.hideSearchResult();
				} else if (self.viewMode === VIEW_MODE.Detail){
					self.hideRouteDetail();
				}
				if ($('.toastjs.danger').length > 0){
					$('.toastjs-btn--close').click();
				}
			});

			$('#navigate').on('click', function(){
				self.viewMode = VIEW_MODE.Route;
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
				self.viewMode = VIEW_MODE.Search;
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
			//		 Add the clear funtion in searchbox
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
			if (self.routeDestinationMarker){
				self.routeDestinationMarker.remove();
			}
			$('#searchboxinput').val(place.name);
			if (typeof(place.geometry) != "undefined"){
				self.routeDestination = place;
				var location = place.geometry.location,
					bounds = self.getPlaceBound(place);

				var popup = util.getPopupDiv(place.icon, place.name);
				self.routeDestinationMarker = L.marker([location.lat(), location.lng()], {icon: util.getIcon('red')})
					.bindPopup(popup, {minWidth : 150})
					.on('popupopen', function (popup) {
						if (self.viewMode === VIEW_MODE.Search){
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
			return L.latLngBounds(L.latLng(viewport.ma.j, viewport.fa.j),
								  L.latLng(viewport.ma.l, viewport.fa.l));
		}

		self.setMapHeight = function(height){
			$('#map').height(height);
			setTimeout(function(){ self.map.invalidateSize()}, 100);
		}

		self.showSearchResult = function(){
			$('#route-search').hide();
			$('#boxcontainer').show();
			$('#search-result').css('display', 'flex');
			if (self.routeDestinationMarker){
				self.setMapHeight('calc(100% - 140px)');
				$('#searchboxinput').val($('#search-result-title').text());
			}
			else{
				self.setMapHeight('100%');
			}
			if (self.routeOriginMarker){
				self.routeOriginMarker.remove();
				self.routeOriginMarker = null;
			}
		}

		self.hideSearchResult = function(){
			if (self.viewMode === VIEW_MODE.Route){
				self.setMapHeight('calc(100% - 100px)');
			} else if (self.viewMode === VIEW_MODE.Search){
				self.setMapHeight('100%');
			}
			$('#search-result').hide();
			$('#searchboxinput').val('');
			$('#searchboxinput').attr('placeholder', '');
			if (self.viewMode === VIEW_MODE.Search){
				self.routeDestination = null;
				if (self.routeDestinationMarker){
					self.routeDestinationMarker.remove();
					self.routeDestinationMarker = null;
				}
			}
		}

		self.originSet = function(place){
			if (self.routeOriginMarker){
				self.routeOriginMarker.remove();
			}
			$('#route-origin-input').val(place.name);
			self.routeOrigin = place;
			var location = place.geometry.location,
				popup = util.getPopupDiv(place.icon, place.name);
			self.routeOriginMarker = L.marker([location.lat(), location.lng()], {icon: util.getIcon('green')})
				.bindPopup(popup, {minWidth : 150})
				.on('popupopen', function (popup) {
					console.log('origin!');
			});;
			self.routeOriginMarker.addTo(self.map);
			self.searchRouteAndUpdateView();
		}

		self.destinationSet = function(place){
			if (self.routeDestinationMarker){
				self.routeDestinationMarker.remove();
			}
			$('#route-destination-input').val(place.name);
			self.routeDestination = place;
			var location = place.geometry.location,
				popup = util.getPopupDiv(place.icon, place.name);
			self.routeDestinationMarker = L.marker([location.lat(), location.lng()], {icon: util.getIcon('red')})
				.bindPopup(popup, {minWidth : 150})
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
				var directionsService = new google.maps.DirectionsService;
				directionsService.route({
					origin: {lat: originLocation.lat(), lng: originLocation.lng()},
					destination: {lat: destinationLocation.lat(), lng: destinationLocation.lng()},
					travelMode: 'TRANSIT'
				}, function(response, status) {
					if (status === 'OK') {
						self.routeSearchDone(response);
						self.routeBound = new L.LatLngBounds(points);
						self.map.fitBounds(self.routeBound, {padding: [50, 50]});
					} else {
						new Toast({message: '找不到路線!', type: 'danger'});
					}
				});
			}
			else if (points.length == 1){
				var place = self.routeOrigin ? self.routeOrigin : self.routeDestination;
				self.map.fitBounds(self.getPlaceBound(place));
			}
		}

		self.routeSearchDone = function(response){
			self.clearRouteResult();
			console.log(response);
			var leg = response.routes[0].legs[0],
				steps = leg.steps,
				routeBriefHtml = '',
				shouldHide = false;
			self.routeSummary = {
				startPos: $('#route-origin-input').val(),
				startTime: leg.departure_time == null ? '' : leg.departure_time.text,
				endPos: $('#route-destination-input').val(),
				endTime: leg.arrival_time == null ? '' : leg.arrival_time.text,
				distance: leg.distance.text,
				duration: leg.duration.text
			};
			for (var i = 0; i < steps.length; ++i){
				var mode = steps[i].travel_mode,
					transitMode = mode,
					thisShouldHide = steps.length > 7 && mode == 'WALKING';
				if (i > 0 && !shouldHide){
					routeBriefHtml += util.getIconHtml('RIGHT');
				}
				shouldHide = thisShouldHide;
				var step = {
					mode: mode,
					instruction: steps[i].instructions,
					distance: steps[i].distance.text,
					duration: steps[i].duration.text,
					idx: i
				};
				if (mode == 'TRANSIT'){
					transitMode = steps[i].transit.line.vehicle.type;
					console.log(transitMode);
					console.log(steps[i]);
					step.mode = transitMode;
					step.title = steps[i].transit.line.short_name;
					step.name = steps[i].transit.line.name;
					step.instruction = '{0}{1}'.format(
						transitMode == 'HEAVY_RAIL' ? '' : '往',
						steps[i].transit.headsign);
					step.depStop = steps[i].transit.departure_stop.name;
					step.depTime = steps[i].transit.departure_time.text;
					step.arrStop = steps[i].transit.arrival_stop.name;
					step.arrTime = steps[i].transit.arrival_time.text;
					step.color = steps[i].transit.line.color;
					step.depLocation = steps[i].transit.departure_stop.location;
					step.arrLocation = steps[i].transit.arrival_stop.location;
					self.transitIdMap.push(i);
					self.stepDetails.push(step);

					var popup = util.getTransitPopupDiv(step),
						popupOptions = {
							minWidth: Math.min($(window).width() - 80, 350),
							stepIdx: step.idx},
						transitMarker = L.marker([steps[i].start_location.lat(), steps[i].start_location.lng()],
						{icon: util.getTransitIcon(transitMode, step.color)})
						.bindPopup(popup, popupOptions)
						.on('popupopen', function (e) {
							var idx = e.popup.options.stepIdx;
							$('#transit-popup-info-' + idx).click({id: idx}, function(e){
								self.getTransitInfo(e.data.id);
							});
						});
					transitMarker.addTo(self.map);
					self.transitMarkers.push(transitMarker);

					if (!shouldHide){
						routeBriefHtml += "<button id='{0}' class='transit-brief-element'>{1}{2}</button>"
							.format('transit-step-' + i,
								util.getIconHtml(transitMode, step.color),
								util.getTransitNameHtml(step.title));
					}
				} else{
					if (!shouldHide){
						routeBriefHtml += "<button id='{0}' class='transit-brief-element'>{1}</button>"
							.format('transit-step-' + i, util.getIconHtml(transitMode));
					}
					self.stepDetails.push(step);
				}

				var points = steps[i].polyline.points,
					polyline = L.Polyline.fromEncoded(points, util.getLineStyle(transitMode, step.color));
				polyline.addTo(self.map);
				self.routePolylines.push(polyline);
			}
			self.showRouteBrief(routeBriefHtml);
			self.bindTransitBriefEvent();
			if ($('#route-brief-result')[0].scrollHeight > 50){
				$('.transit-name').hide();
			} else {
				$('.transit-name').show();
			}
			$('#route-brief-duration').text(self.routeSummary.duration);
		}

		self.clearRouteResult = function(){
			if (self.routePolylines){
				self.routePolylines.forEach(function(polyline){
					polyline.remove();
				});
			}
			self.routePolylines = [];
			if (self.transitMarkers){
				self.transitMarkers.forEach(function(marker){
					marker.remove();
				});
			}
			self.routeBound = null;
			self.transitMarkers = [];
			self.transitIdMap = [];
			self.stepDetails = [];
			self.routeSummary = null;
			$('#route-brief-container').hide();
			if (self.viewMode === VIEW_MODE.Route){
				self.setMapHeight('calc(100% - 100px)');
			}
		}

		self.showRouteBrief = function(innerHtml){
			self.setMapHeight('calc(100% - 150px)');
			$('#route-brief-result').html(innerHtml);
			$('#route-brief-container').show();
			$('#route-brief-right').bind('click', function(e){
				e.stopPropagation();
				if (self.viewMode === VIEW_MODE.Detail){
					setTimeout(function(){ self.hideRouteDetail() }, 100);
				} else if (self.viewMode === VIEW_MODE.Route){
					setTimeout(function(){ self.showRouteDetail() }, 100);
				} else if (self.viewMode === VIEW_MODE.Info){
					setTimeout(function(){ self.hideTransitInfo() }, 100);
				}
			});
		}

		self.flyToTransit = function(e){
			e.stopPropagation();
			self.map.closePopup();
			self.map.flyToBounds(
				self.routePolylines[e.data.id].getBounds(),
				{duration: 0.5, padding: [50, 50]}
			).once('moveend zoomend', function() {
				var idx = self.transitIdMap.indexOf(e.data.id);
				if (idx != -1 && self.viewMode === VIEW_MODE.Route){
					self.transitMarkers[idx].openPopup();
				}
			});
		}

		self.flyToRouteStop = function(id){
			var theStop = self.currentStops[id],
				pos = new L.LatLng(theStop.StopPosition.PositionLat, theStop.StopPosition.PositionLon);
			self.map.setView(pos, 17);
		}

		self.bindTransitBriefEvent = function(){
			for (var i = 0; i < self.routePolylines.length; i++){
				$('#transit-step-' + i).click({id: i}, function(e){
					self.flyToTransit(e);
				});
			}
		}

		// Click the "double down" button between two transits in detail view
		self.bindTransitDetailEvent = function(){
			for (var i = 0; i < self.routePolylines.length; i++){
				$('#transit-detail-step-' + i).click({id: i}, function(e){
					self.flyToTransit(e);
				});
			}
		}

		// Click the transit "i" button
		self.bindTransitDetailInfoEvent = function(){
			for (var i = 0; i < self.routePolylines.length; i++){
				$('#transit-info-' + i).click({id: i}, function(e){
					self.getTransitInfo(e.data.id);
				});
			}
		}

		// Click each stop in info view
		self.bindRouteStepEvent = function(){
			for (var i = 0; i < self.currentStops.length; i++){
				$('#route-step-' + i).click({id: i}, function(e){
					self.flyToRouteStop(e.data.id);
				});
			}
		}

		self.showRouteDetail = function(){
			if (self.viewMode === VIEW_MODE.Route){
				self.viewMode = VIEW_MODE.Detail;
				self.map.closePopup();
				self.setMapHeight('250px');
				$('#route-detail').html(util.getRouteDetailDiv(self.routeSummary, self.stepDetails));
				$('#route-brief-button').html(util.getIconHtml('DOWN'));
				$('#route-search').hide();
				$('#route-detail').show();
				setTimeout(function(){ self.map.fitBounds(self.routeBound, {maxZoom: 18, padding: [50, 50]}) }, 100);
				self.bindTransitDetailEvent();
				self.bindTransitDetailInfoEvent();
			}
			else if (self.viewMode === VIEW_MODE.Detail){
				if (self.routeOriginMarker){
					self.routeOriginMarker.addTo(self.map);
				}
				if (self.routeDestinationMarker){
					self.routeDestinationMarker.addTo(self.map);
				}
				if (self.transitMarkers){
					self.transitMarkers.forEach(function(marker){
						marker.addTo(self.map);
					});
				}
				if (self.routePolylines){
					for (var i = 0; i < self.routePolylines.length; ++i){
						if (i != self.transitIdx){
							self.routePolylines[i].addTo(self.map);
						}
					}
				}
			}
		}

		self.hideRouteDetail = function(){
			if (self.viewMode === VIEW_MODE.Detail){
				self.viewMode = VIEW_MODE.Route;
				$('#route-brief-button').html(util.getIconHtml('UP'));
				$('#route-search').show();
				$('#route-detail').hide();
				self.setMapHeight('calc(100% - 150px)');
				setTimeout(function(){ self.map.fitBounds(self.routeBound, {maxZoom: 18, padding: [50, 50]}) }, 100);
			}
		}

		self.getTransitInfo = function(transitIdx){
			console.log("Show transit info " + transitIdx);
			self.transitIdx = transitIdx;
			var step = self.stepDetails[transitIdx];
			var locations = [],
				addresses = [];
			locations.push(step.depLocation);
			locations.push(step.arrLocation);
			googleSvc.searchByLocations([step.depLocation, step.arrLocation], addresses, function(address){
				transportSvc.getTransportDetail(step, address, function (info){
					self.routeStopList = info;
					self.showTransitInfo(step);
				});
			});
		}

		self.showTransitInfo = function(step){
			if (self.viewMode === VIEW_MODE.Route){
				self.showRouteDetail();
			}
			var bound = new L.LatLngBounds([step.depLocation.lat(), step.depLocation.lng()],
				[step.arrLocation.lat(), step.arrLocation.lng()]);
			setTimeout(function(){ self.map.fitBounds(bound, {maxZoom: 18, padding: [50, 50]}) }, 100);
			self.viewMode = VIEW_MODE.Info;
			self.routeStopMarkers = [];
			self.map.options.maxZoom = 18;

			console.log("routeStopList");
			console.log(self.routeStopList);
			console.log(step);
			self.getRouteInfoIdxList(step);
			console.log("routeInfoIdxList:");
			console.log(self.routeInfoIdxList);

			$('#transit-info').html(util.getTransitInfoDiv(self.routeStopList, step, self.routeInfoIdxList));
			$('#transit-info').show();
			$('#transit-info-back').bind('click', function(e){
				self.hideTransitInfo();
			});
			
			$('#transit-info-bottom').show();
			self.addStopMarkers();
			self.bindRouteStepEvent();

			// Hide other markers
			if (self.routeOriginMarker){
				self.routeOriginMarker.remove();
			}
			if (self.routeDestinationMarker){
				self.routeDestinationMarker.remove();
			}
			if (self.transitMarkers){
				self.transitMarkers.forEach(function(marker){
					marker.remove();
				});
			}
			if (self.routePolylines){
				for (var i = 0; i < self.routePolylines.length; ++i){
					if (i != self.transitIdx){
						self.routePolylines[i].remove();
					}
				}
			}
		}

		self.hideTransitInfo = function(){
			self.viewMode = VIEW_MODE.Detail;
			$('#transit-info').hide();
			$('#transit-info-bottom').hide();
			
			if (self.routeStopMarkers){
				self.routeStopMarkers.forEach(function(marker){
					marker.remove();
				});
			}
			self.routeStopMarkers = [];
			self.currentStops = [];
			self.transitIdx = null;
			self.map.options.maxZoom = 22;

			self.showRouteDetail();
		}

		self.getRouteInfoIdxList = function(step){
			self.routeInfoIdxList = [];
			var direction = null,
				depPos = new L.LatLng(step.depLocation.lat(), step.depLocation.lng()),
				arrPos = new L.LatLng(step.arrLocation.lat(), step.arrLocation.lng());
			for (var i = 0; i < self.routeStopList.length; ++i){
				var routeInfo = self.routeStopList[i];
				if (direction != null && routeInfo.Direction != direction){
					continue;
				}
				var stops = routeInfo.Stops,
					depIdx = -1;
				for (var j = 0; j < stops.length; ++j){
					var stopPos = new L.LatLng(stops[j].StopPosition.PositionLat,
						stops[j].StopPosition.PositionLon);
					if (stops[j].StopName.Zh_tw == step.depStop ||
						stopPos.distanceTo(depPos) < 50){
						depIdx = j;
					} else if (stops[j].StopName.Zh_tw == step.arrStop ||
						stopPos.distanceTo(arrPos) < 50){
						if (depIdx != -1){
							direction = routeInfo.Direction;
							self.routeInfoIdxList.push({
								'infoIdx': i,
								'depIdx': depIdx,
								'arrIdx': j
							});
						} else{
							direction = (routeInfo.Direction == 0) ? 1 : 0;
						}
						break;
					}
				}
			}
		}

		self.addStopMarkers = function(){
			var infoObj = self.routeInfoIdxList[0],
				stops = self.routeStopList[infoObj.infoIdx].Stops;
			self.currentStops = stops;
			for (var i = infoObj.depIdx; i <= infoObj.arrIdx; ++i){
				if (i >= stops.length){
					break;
				}

				var style = {radius: 5, weight: 1, color: '#0967A4', fillColor: '#A0CFED', fillOpacity: 1};
				if (i == infoObj.depIdx || i == infoObj.arrIdx){
					style = {radius: 5, weight: 2, color: '#7B7412', fillColor: '#F6E938', fillOpacity: 1};
				}
				var position = L.latLng(stops[i].StopPosition.PositionLat,
								stops[i].StopPosition.PositionLon),
					marker = L.circleMarker(position, style);
				marker.addTo(self.map);
				self.routeStopMarkers.push(marker);
			}
		}
	}
	return new MapView();
});

// TODO:
// (0) Google search
// Show more details (markers) on map, instead of just select the first result
// => may fix the "Route not found" bug
//
// (1) Google route
// *Customize departure/arrival date time
// Add arrow on path, add border of the path
// Show more route options
// Add origin/destination marker in detail map?
//
// (2) Get Bus information
// Make detail transit able to expand and collapse
// Display transit info
//
// Bug:
// Route not found from 壢新醫院 to 武陵高中