L.Control.Location = L.Control.extend({
    onAdd: function(map) {
        console.log(map);
        var img = L.DomUtil.create('img');
        img.src = 'css/images/location.svg';
        img.style.width = '20px';
        img.onclick = function(){
            console.log("location clicked");
            var geoSuccess = function(pos) {
                console.log(pos.coords.latitude);
                console.log(pos.coords.longitude);
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