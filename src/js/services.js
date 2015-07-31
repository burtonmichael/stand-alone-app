angular.module('searchApp.services', ['ngCookies'])

.factory('StyleService', function() {

	var shadeColor = function(color, percent) {

	    var color = color.substring(1);

	    if (color.length === 3) {
	        var split = color.split("");
	        color = split[0] + split[0] + split[1] + split[1] + split[2] + split[2];
	    }

	    var R = parseInt(color.substring(0, 2), 16);
	    var G = parseInt(color.substring(2, 4), 16);
	    var B = parseInt(color.substring(4, 6), 16);

	    R = parseInt(R * (100 + percent) / 100);
	    G = parseInt(G * (100 + percent) / 100);
	    B = parseInt(B * (100 + percent) / 100);

	    R = (R < 255) ? R : 255;
	    G = (G < 255) ? G : 255;
	    B = (B < 255) ? B : 255;

	    var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
	    var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
	    var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

	    return "#" + RR + GG + BB;
	}

	var contrastColor = function(color) {

	    var color = color.substring(1);

	    if (color.length === 3) {
	        var split = color.split("");
	        color = split[0] + split[0] + split[1] + split[1] + split[2] + split[2];
	    }

	    var R = parseInt(color.substring(0, 2), 16);
	    var G = parseInt(color.substring(2, 4), 16);
	    var B = parseInt(color.substring(4, 6), 16);

	    var contrast = ((R * 299) + (G * 587) + (B * 114)) / 1000;
	    return (contrast >= 200) ? '#212121' : '#FFF';
	}

	var addRule = function(elem, styles) {
	    var rule = elem + " {"

	    angular.forEach(styles, function(style) {
	        rule += style[0] + ":" + style[1] + ";"
	    })
	    rule += "}"

	    return rule
	}

	return {
		setColor: function(main, text) {

		    var main = "#" + main;
		    var text = text ? "#" + text : contrastColor(main);

		    var styles = "";

		    styles += addRule('.form-group--button button, \
		        .ui-datepicker-prev:after, \
		        .ui-datepicker-next:after, \
		        .ui-datepicker .ui-state-default.ui-state-hover, \
		        .ui-datepicker .ui-state-default.ui-state-active, \
		        .ui-datepicker .ui-datepicker-header, \
		        .ui-datepicker-prev:after, .ui-datepicker-next:after', [
		        ["color", text],
		    ])

		    styles += addRule('.form-group--button button, \
		        .ui-datepicker .ui-datepicker-header, \
		        .ui-datepicker .ui-state-default.ui-state-active, \
		        .ui-datepicker .ui-datepicker-prev, \
		        .ui-datepicker .ui-datepicker-next', [
		        ["background", main]
		    ])

		    styles += addRule('.form-group--button button:hover, .form-group--button button:focus, \
		        .ui-datepicker .ui-state-default.ui-state-hover, \
		        .ui-datepicker .ui-datepicker-prev-hover, \
		        .ui-datepicker .ui-datepicker-next-hover', [
		        ["background", shadeColor(main, 10)]
		    ])

		    styles += addRule('.form-group--button button:active', [
		        ["background", shadeColor(main, -6)]
		    ])

		    var style = document.createElement('style')

	    	style.innerHTML = styles;

		    document.head.appendChild(style);
		}
	}
})

.factory('TimeService', function(){
	return {
		getHours: function() {
	    	var hours = [];

	    	if (hours.length > 0) return hours;

	    	for (var i = 0; i < 24; i++) {
	    		var label = i < 10 ? '0' + i : '' + i;
	    		hours.push({
	    			name: label,
	    			value: i
	    		});
	    	}

	    	return hours;
		},
		getMinutes: function() {
	    	var minutes = [];

	    	if (minutes.length > 0) return minutes;

	    	for (var i = 0; i < 4; i++) {
	    		j = i * 15;
	    		var label = j === 0 ? '0' + j : '' + j;
	    		minutes.push({
	    			name: label,
	    			value: j
	    		});
	    	}

	    	return minutes;
		}
	};
})

.factory('LocationService', ['$q', '$http', '$cookies', 'SessionService', function($q, $http, $cookies, SessionService){
	return {
		getAjax: function(params) {
			var deferred = $q.defer();
			var queryStr = '?';
			var base = SessionService.affUrl ? 'http://' + SessionService.affUrl : "http://www.rentalcars.com";

			var page = "/InPathAjaxAction.do";

			if (SessionService.jsessionid !== undefined) page += ";jsessionid=" + SessionService.jessionid;

			for(var prop in params) {
				queryStr += prop + '=' + decodeURIComponent(params[prop]) + '&';
			}

			$http({
				method: "GET",
				url: base + page + queryStr + SessionService.addAjaxReq
			})
				.success(function(data) {
					SessionService.jsessionid = $cookies.JSESSIONID;
					deferred.resolve(data.cityList || data.locationList);
				})
				.error(function(data) {
					deferred.resolve(false);
				});
			return deferred.promise;
		}
	};
}])

.factory('TranslationsService', ['$q', '$http', 'SessionService', function($q, $http, SessionService){
	var promise = null;
	return {
		get: function() {
			if (promise) {
				return promise;
			} else {
				if (SessionService.messages) {
					promise = $q.all([
						$http.get("/stand-alone-locale/translations/" + SessionService.preflang + ".json"),
						$http.get("import/messages/" + SessionService.messages + ".json")
					])
						.then(function(data){
							moment.defineLocale("preflang", resp.data.moment);
							moment.locale("preflang");
							return angular.extend({}, data[0].data, data[1].data);
						});
				} else {
					promise = $http.get("/stand-alone-locale/translations/" + SessionService.preflang + ".json")
						.then(function(resp) {
							moment.defineLocale("preflang", resp.data.moment);
							moment.locale("preflang");
							return resp.data;
						});
				}
				return promise;
			}
		}
	};
}])

.factory('SessionService', ['$location', '$cookies' ,function($location, $cookies){

	var factory = {
		preflang: "en",
		addAjaxReq: ""
	};

	var camelCase = function(parameter) {
	    return parameter.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
	        if (p2) return p2.toUpperCase();
	        return p1.toLowerCase();
	    });
	};

	for(var parameter in $location.search()) {
		factory[camelCase(parameter)] = decodeURIComponent($location.search()[parameter]);
	}

	factory.isRTL = (factory.preflang == 'he' || factory.preflang == 'ar') ? true : false;

	if (factory.hasOwnProperty('preflang')) factory.addAjaxReq += '&preflang=' + factory.preflang;
	if (factory.hasOwnProperty('affiliateCode')) factory.addAjaxReq += '&affiliateCode=' + factory.affiliateCode;
	if (factory.hasOwnProperty('prefcurrency')) factory.addAjaxReq += '&prefcurrency=' + factory.prefcurrency;
	if (factory.hasOwnProperty('cor')) factory.addAjaxReq += '&cor=' + factory.cor;

	factory.jsessionid = $cookies.JSESSIONID;

	return factory;

}]);