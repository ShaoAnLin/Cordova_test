L.Control.Location = L.Control.extend({
	onAdd: function(map) {
		var img = L.DomUtil.create('img');
		img.src = 'css/images/locate-me.svg';
		img.style.width = '30px';
		img.onclick = function(){
			var geoSuccess = function(pos) {
				var latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
				map.setView(latlng, 15);
			};
			var geoError = function(error) {
			  console.log('Error code: ' + error.code);
			};
			navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
				maximumAge: 5 * 60 * 1000,
			});
		};
		return img;
	}
});

L.control.location = function(opts) {
	return new L.Control.Location(opts);
}