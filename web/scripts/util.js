define("util", [], function() {
	var util = {};

	util.transitDict = {
		'BUS': '公車',
		'SUBWAY': '捷運',
		'HEACY_RAIL': '火車'
	}
	
	util.getPopupDiv = function(icon, name){
		return "<div class='popup-row'>\
					<div style='float: left;'><img class='popup-icon' src='{0}'/></div>\
					<span style='font-size: 22px'>{1}</span>\
				</div>".format(icon, name);
	}
	
	util.getTransitPopupDiv = function(transit){
		var instruction = '{0} 開往 {1}'.format(this.transitDict[transit.mode], transit.headsign);
		return "<div id='transit-popup-title'>{0}\
					<div id='transit-popup-short-name'>{1}</div>\
					<div id='transit-popup-name'>{2}</div>\
				</div>\
				<div id='transit-popup-instruction'>{3}</div>\
				<div id='transit-popup-detail'>\
					<div id='transit-popup-departure' class='popup-row'>\
						<span id='transit-popup-dep-time'>{4}</span>\
						<span id='transit-popup-dep-stop'>{5}</span>\
					</div>\
					<div id='transit-popup-duration'>{6}</div>\
					<i class='fas fa-angle-double-down'></i>\
					<div id='transit-popup-arrival' class='popup-row'>\
						<span id='transit-popup-arr-time'>{7}</span>\
						<span id='transit-popup-arr-stop'>{8}</span>\
					</div>\
				</div>".format(this.getIconHtml(transit.mode),
					transit.title, transit.name,
					instruction,
					transit.depTime, transit.depStop,
					transit.duration,
					transit.arrTime, transit.arrStop);
	}

	util.getIcon = function(color){
		return L.icon({
			iconUrl: 'css/images/marker-{0}.svg'.format(color),
			iconSize: [30, 40],
			popupAnchor: [0, -10],
			shadowAnchor: [12, 20],
			shadowUrl: 'css/images/marker-shadow.png'
		});
	}
	
	util.getTransitIcon = function(type){
		if (type == 'HEAVY_RAIL'){
			type = 'train';
		}
		return L.icon({
			iconUrl: 'css/images/marker-transit-{0}.svg'.format(type),
			iconSize: [20, 20],
			popupAnchor: [0, -10]
		});
	}
	
	util.getIconHtml = function(type){
		if (type == 'WALKING'){
			return '<i class="fas fa-walking"></i>';
		}else if (type == 'RIGHT'){
			return '<i class="fas fa-angle-right"></i>';
		} else if (type == 'SUBWAY'){
			return '<i class="fas fa-subway"></i>';
		} else if (type == 'BUS'){
			return '<i class="fas fa-bus"></i>';
		} else if (type == 'HEAVY_RAIL'){
			return '<i class="fas fa-train"></i>';
		}
	}
	
	util.getTransitNameHtml = function(text){
		return '<div class="transit-name">{0}</div>'.format(text);
	}
	
	util.getLineStyle = function(mode){
		if (mode == 'SUBWAY'){
			return {weight: 4, color: '#008800'};
		}
		else if (mode == 'BUS'){
			return {weight: 4, color: '#FF4500'};
		}
		else if (mode == 'HEAVY_RAIL'){
			return {weight: 4, color: '#0000FF'};
		}
		else if (mode == 'WALKING'){
			return {weight: 4, color: '#5f6060', dashArray: '10 15', lineCap: 'round'};
		}
	}
    return util;
});