define('busService', [], function() {
    var busSvc = {};

    busSvc.baseUrl = 'http://ptx.transportdata.tw/MOTC/v2/';

    busSvc.cityMap = {
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

    busSvc.getBusDetail = function(step){
        this.getBusRouteStops(step.title);
    }

    busSvc.getBusRouteStops = function(routeId, city){
        if (city == null){
            city = 'Taipei';
        }
        var url = '{0}/Bus/DisplayStopOfRoute/City/{1}/{2}'
            .format(this.baseUrl, city, routeId);

        $.ajax({
            url: url,
            success: function(result){
                console.log(result);
            }
        });
    }

    return busSvc;
});