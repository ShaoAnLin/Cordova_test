define("util", [], function() {
	var util = {};

	util.transitBackgroundColor = {
		'BUS': '#FFC0CB',
		'SUBWAY': '#CFE886',
		'HEAVY_RAIL': '#ADD8E6'
	};

	util.iconHtml = {
		'WALKING': '<i class="fas fa-walking"></i>',
		'RIGHT': '<i class="fas fa-angle-right"></i>',
		'SUBWAY': '<i class="fas fa-subway"></i>',
		'BUS': '<i class="fas fa-bus"></i>', 
		'HEAVY_RAIL': '<i class="fas fa-train"></i>',
		'UP': '<i class="fas fa-chevron-up"></i>',
		'DOWN': '<i class="fas fa-chevron-down"></i>'
	};

	util.lineStyle = {
		'SUBWAY': {weight: 4, color: '#008800'},
		'BUS': {weight: 4, color: '#FF4500'},
		'HEAVY_RAIL': {weight: 4, color: '#0000FF'},
		'WALKING': {weight: 4, color: '#5f6060', dashArray: '10 15', lineCap: 'round'}
	};
	
	util.getPopupDiv = function(icon, name){
		return "<div class='div-row'>\
					<div style='float: left;'><img class='popup-icon' src='{0}'/></div>\
					<span style='font-size: 18px'>{1}</span>\
				</div>".format(icon, name);
	};
	
	util.getTransitPopupDiv = function(transit){
		var name = transit.name == null ? '' : transit.name;
		return "<div id='transit-popup-title'>{0}\
					<div id='transit-popup-short-name'>{1}</div>\
					<div id='transit-popup-name'>{2}</div>\
				</div>\
				<div class='transit-instruction'>{3}</div>\
				<div id='transit-popup-detail'>\
					<div class='div-row'>\
						<span class='transit-time-col'>{4}</span>\
						<span>{5}</span>\
					</div>\
					<div class='transit-duration-container'>\
						<div class='transit-duration'>{6}</div>\
						<i class='fas fa-angle-double-down'></i>\
					</div>\
					<div class='div-row'>\
						<span class='transit-time-col'>{7}</span>\
						<span>{8}</span>\
					</div>\
				</div>".format(this.iconHtml[transit.mode],
					transit.title, name,
					transit.instruction,
					transit.depTime, transit.depStop,
					transit.duration,
					transit.arrTime, transit.arrStop);
	};

	// TODO: bind click event to fitBounds
	util.getRouteDetailDiv = function(summary, steps){
		var html = this.getRouteStepDiv(summary.startTime, summary.startPos);
		for (var i = 0; i < steps.length; ++i){
			if (steps[i].mode == 'WALKING'){
				html += this.getRouteTransitDiv(steps[i]);
			} else{
				var stepHtml = "<div class='detail-single-transit' style='background-color: {0}'>{1}{2}{3}</div>"
					.format(this.transitBackgroundColor[steps[i].mode],
							this.getRouteStepDiv(steps[i].depTime, steps[i].depStop),
							this.getRouteTransitDiv(steps[i]),
							this.getRouteStepDiv(steps[i].arrTime, steps[i].arrStop));
				html += stepHtml;
			}
		}
		html += endDiv = this.getRouteStepDiv(summary.endTime, summary.endPos);
		return html;
	};

	util.getRouteStepDiv = function(time, pos){
		return "<div class='div-row'>\
					<span class='transit-time-col' style='font-size: 14px'>{0}</span>\
					<span style='font-size: 16px'>{1}</span>\
				</div>".format(time, pos);
	};

	util.getRouteTransitDiv = function(step){
		var instruction = step.mode == 'WALKING' ? step.distance : step.instruction;
		return "<div class='transit-duration-container'>\
					<span class='transit-duration'>{0}</span>\
					<i class='fas fa-angle-double-down'></i>{1}\
					<span class='transit-instruction'>{2}</span>\
				</div>".format(step.duration, this.iconHtml[step.mode], instruction);
	};

	util.getIcon = function(color){
		return L.icon({
			iconUrl: 'css/images/marker-{0}.svg'.format(color),
			iconSize: [30, 40],
			popupAnchor: [0, -10],
			shadowAnchor: [12, 20],
			shadowUrl: 'css/images/marker-shadow.png'
		});
	};
	
	util.getTransitIcon = function(type){
		if (type == 'HEAVY_RAIL'){
			type = 'train';
		} else if (type == 'BUS'){
			type = 'bus';
		} else if (type == 'SUBWAY'){
			type = 'subway';
		}
		return L.icon({
			iconUrl: 'css/images/marker-transit-{0}.svg'.format(type),
			iconSize: [20, 20],
			popupAnchor: [0, -10]
		});
	};
	
	util.getTransitNameHtml = function(text){
		return '<div class="transit-name">{0}</div>'.format(text);
	};
    return util;
});