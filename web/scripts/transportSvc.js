define('transportSvc', [], function() {
    var instance = {};

    instance.baseUrl = 'http://ptx.transportdata.tw/MOTC/v2/';

    instance.cityList = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '基隆市',
        '新竹市', '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '嘉義市', '屏東縣',
        '宜蘭縣', '花蓮縣', '台東縣', '金門縣', '澎湖縣', '連江縣'];

    instance.cityMap = {
        '台北市': 'Taipei',
        '新北市': 'NewTaipei',
        '桃園市': 'Taoyuan',
        '台中市': 'Taichung',
        '台南市': 'Tainan',
        '高雄市': 'Kaohsiung',
        '基隆市': 'Keelung',
        '新竹市': 'Hsinchu',
        '新竹縣': 'HsinchuCounty',
        '苗栗縣': 'MiaoliCounty',
        '彰化縣': 'ChanghuaCounty',
        '南投縣': 'NantouCounty',
        '雲林縣': 'YunlinCounty',
        '嘉義縣': 'ChiayiCounty',
        '嘉義市': 'Chiayi',
        '屏東縣': 'PingtungCounty',
        '宜蘭縣': 'YilanCounty',
        '花蓮縣': 'HualienCounty',
        '台東縣': 'TaitungCounty',
        '金門縣': 'KinmenCounty',
        '澎湖縣': 'PenghuCounty',
        '連江縣': 'LienchiangCounty'
    }

    instance.getCity = function(address){
        for (var i = 0; i < address.length; ++i){
            if (this.cityList.includes(address[i].short_name)){
                return this.cityMap[address[i].short_name];
            }
        }
        return null;
    }

    instance.getTransportDetail = function(step, address, callback){
        var city = this.getCity(address);
        console.log(step);
        if (step.mode == 'BUS'){
            this.getBusRouteStops(step.title, city, callback);
        } else if (step.mode == 'SUBWAY'){
            this.getMetroRouteStops(step.title, city, callback);
        } else if (step.mode == 'HEAVY_RAIL'){
            this.getRailRouteStops(step.title, city, callback);
        }
    }

    instance.getBusRouteStops = function(routeId, city, callback){
        if (city == null){
            city = 'Taipei';
        }
        var apiType = (city === 'Taipei' || city === 'NewTaipei')
            ? 'DisplayStopOfRoute' : 'StopOfRoute';
        var url = '{0}/Bus/{1}/City/{2}/{3}'
            .format(this.baseUrl, apiType, city, routeId);

        $.ajax({
            url: url,
            success: function(result){
                if (result.length > 0){
                    callback(result);
                } else {
                    this.getInterCityBusRouteStops(routeId, callback);
                }
            }.bind(this)
        });
    }

    instance.getInterCityBusRouteStops = function(routeId, callback){
        var url = '{0}/Bus/StopOfRoute/InterCity/{1}'
            .format(this.baseUrl, routeId);

        $.ajax({
            url: url,
            success: function(result){
                callback(result);
            }
        });
    }

    // TODO
    instance.getMetroRouteStops = function(routeId, city, callback){
        callback("Get metro stops");
    }

    // TODO
    instance.getRailRouteStops = function(routeId, city, callback){
        callback("Get rail stops");
    }

    return instance;
});