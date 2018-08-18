define("util", [], function() {
	var util = {};
	
	util.getPopupDiv = function(icon, name){
		return "<img src='{0}' style='width: 20px; float: left; padding-right: 10px'/><span style='font-size: 14px'>{1}</span>".format(icon, name);
	}
	
	util.getTransitPopupDiv = function(transit){
		return "<div id='transit-popup-title'>{0}\
					<div id='transit-popup-short-name'>{1}</div>\
					<div id='transit-popup-name'>{2}</div>\
				</div>\
				<div id='transit-popup-detail'>\
					<div id='transit-popup-departure' class='popup-row'>\
						<span id='transit-popup-dep-time'>{3}</span>\
						<span id='transit-popup-dep-stop'>{4}</span>\
					</div>\
					<i class='fas fa-angle-double-down'></i>\
					<div id='transit-popup-arrival' class='popup-row'>\
						<span id='transit-popup-arr-time'>{5}</span>\
						<span id='transit-popup-arr-stop'>{6}</span>\
					</div>\
				</div>".format(this.getIconHtml(transit.mode), transit.title, transit.name,
							   transit.depTime, transit.depStop, transit.arrTime, transit.arrStop);
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
			return {weight: 2, color: '#5f6060', dashArray: "5 10",};
		}
	}
    return util;
});