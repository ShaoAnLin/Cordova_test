define("util", [], function() {
	var util = {};

	util.transitBackgroundColor = {
		'BUS': '#FFC0CB',
		'SUBWAY': '#CFE886',
		'HEAVY_RAIL': '#ADD8E6'
	};
	
	util.defaultColor = {
		'SUBWAY': '#008800',
		'BUS': '#FF4500',
		'HEAVY_RAIL': '#0000FF'
	}

	util.iconHtml = {
		'WALKING': '<i class="fas fa-walking"></i>',
		'RIGHT': '<i class="fas fa-angle-right"></i>',
		'SUBWAY': '<i class="fas fa-subway" style="color: {0}"></i>',
		'BUS': '<i class="fas fa-bus" style="color: {0}"></i>', 
		'HEAVY_RAIL': '<i class="fas fa-train" style="color: {0}"></i>',
		'UP': '<i class="fas fa-chevron-up"></i>',
		'DOWN': '<i class="fas fa-chevron-down"></i>'
	};
	
	util.getIconHtml = function(mode, color){
		if (color == null){
			color = this.defaultColor[mode];
		}
		if (mode == 'SUBWAY' || mode == 'BUS' || mode == 'HEAVY_RAIL'){
			return this.iconHtml[mode].format(color);
		} else {
			return this.iconHtml[mode];
		}
	}

	util.getLineStyle = function(mode, color){
		if (mode == 'WALKING'){
			return {weight: 4, color: '#5f6060', dashArray: '10 15', lineCap: 'round'};
		} else if (color == null){
			color = this.defaultColor[mode];
		}
		return {weight: 8, color: color};
	};
	
	util.getPopupDiv = function(icon, name){
		return "<div class='div-row'>\
					<div style='float: left;'><img class='popup-icon' src='{0}'/></div>\
					<span style='font-size: 18px'>{1}</span>\
				</div>".format(icon, name);
	};
	
	util.getTransitPopupDiv = function(transit){
		var html = this.getRouteSummaryDiv(transit, true);
		html += "<div class='transit-instruction'>{0}</div>".format(transit.instruction);
		html += "<div id='transit-popup-detail'>{0}{1}{2}</div>".format(
			this.getRouteStepDiv(transit.depTime, transit.depStop),
			this.getRouteTransitDiv(transit, true),
			this.getRouteStepDiv(transit.arrTime, transit.arrStop)
		);
		return html;
	};

	util.getRouteDetailDiv = function(summary, steps){
		var html = this.getRouteStepDiv(summary.startTime, summary.startPos);
		for (var i = 0; i < steps.length; ++i){
			if (steps[i].mode == 'WALKING'){
				html += this.getRouteTransitDiv(steps[i], false);
			} else{
				var color = (steps[i].color == null) ? this.defaultColor[steps[i].mode] : steps[i].color,
					stepHtml = "<div class='detail-single-transit' style='background-color: {0}'>{1}{2}{3}{4}</div>"
					.format(pSBC(0.9, color),
							this.getRouteSummaryDiv(steps[i], false),
							this.getRouteStepDiv(steps[i].depTime, steps[i].depStop),
							this.getRouteTransitDiv(steps[i], false),
							this.getRouteStepDiv(steps[i].arrTime, steps[i].arrStop));
				html += stepHtml;
			}
		}
		html += endDiv = this.getRouteStepDiv(summary.endTime, summary.endPos);
		return html;
	};

	util.getRouteSummaryDiv = function(step, isPopup){
		var name = step.name == null ? '' : step.name,
			infoId = isPopup ? 'transit-popup-info-' + step.idx : 'transit-info-' + step.idx;
		return "<div class='transit-title-container'>\
					<div class='transit-title'>{0}\
						<div class='transit-short-name'>{1}</div>\
						<div class='transit-name'>{2}</div>\
					</div>\
					<div id='{3}'>\
						<button class='fas fa-info-circle'></button>\
					</div>\
				</div>".format(this.getIconHtml(step.mode, step.color),
					step.title, name, infoId);
	}

	util.getRouteStepDiv = function(time, pos){
		return "<div class='div-row'>\
					<span class='transit-time-col' style='font-size: 14px'>{0}</span>\
					<span style='font-size: 16px'>{1}</span>\
				</div>".format(time, pos);
	};

	util.getRouteTransitDiv = function(step, isPopup){
		var html = "",
			htmlId = "",
			htmlType = isPopup ? "div" : "button";
		if (!isPopup){
			if (step.mode == 'WALKING'){
				html = "{0}<span class='transit-instruction'>{1}</span>".format(
					this.getIconHtml(step.mode, step.color), step.distance);
			} else{
				html = "<span class='transit-instruction'>{0}</span>".format(step.instruction);
			}
			htmlId = "id='transit-detail-step-{0}' ".format(step.idx);
		}
		return "<{3} {0}class='transit-duration-container'>\
					<span class='transit-duration'>{1}</span>\
					<i class='fas fa-angle-double-down'></i>{2}\
				</{3}>".format(htmlId, step.duration, html, htmlType);
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
	
	util.getTransitIcon = function(type, color){
		var iconColor = color == null ? this.defaultColor[type] : color;
		const iconHtml = "<div ='marker-container'><span class='marker-background'></span><div class='transit-marker'>{0}</div></div>".format(
			this.iconHtml[type].format(iconColor));

		return L.divIcon({
			className: "myIcon",
			popupAnchor: [7, -5],
			html: iconHtml
		})
	};
	
	util.getTransitNameHtml = function(text){
		return '<div class="transit-name">{0}</div>'.format(text);
	};
    return util;
});