define("util", [], function() {
    function Util(){
    	var self = this;
    	
        self.getPopupDiv = function(icon, name){
            return "<img src='{0}' style='width: 20px; float: left; padding-right: 10px'/><span style='font-size: 14px'>{1}</span>".format(icon, name);
        }

        self.getIcon = function(color){
            return L.icon({
                iconUrl: 'css/images/marker-{0}.svg'.format(color),
                iconSize: [30, 40],
                popupAnchor: [0, -10],
                shadowAnchor: [12, 20],
                shadowUrl: 'css/images/marker-shadow.png',
            });
        }
		
		self.getIconHtml = function(type){
			if (type == 'WALKING'){
				return '<i class="fas fa-walking"></i>';
			}else if (type == 'RIGHT'){
				return '<i class="fas fa-angle-right"></i>';
			} else if (type == 'TRANSIT'){
				return '<i class="fas fa-subway"></i>';
			}
		}
		
		self.getTransitNameHtml = function(text){
			return '<div class="transit-name">{0}</div>'.format(text);
		}
		
		self.getLineStyle = function(mode){
			if (mode == 'TRANSIT'){
				return {weight: 4, color: '#f30'};
			}
			else if (mode == 'WALKING'){
				return {weight: 3, color: '#5f6060', dashArray: "10 5",};
			}
		}
    }
    return new Util();
});