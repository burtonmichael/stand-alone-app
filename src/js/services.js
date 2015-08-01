angular.module('searchApp.services', ['ngCookies'])

.factory('StyleService', function() {

	var shadeColor = function(color, percent) {

	    color = color.substring(1);

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
	};

	var contrastColor = function(color) {

	    color = color.substring(1);

	    if (color.length === 3) {
	        var split = color.split("");
	        color = split[0] + split[0] + split[1] + split[1] + split[2] + split[2];
	    }

	    var R = parseInt(color.substring(0, 2), 16);
	    var G = parseInt(color.substring(2, 4), 16);
	    var B = parseInt(color.substring(4, 6), 16);

	    var contrast = ((R * 299) + (G * 587) + (B * 114)) / 1000;
	    return (contrast >= 200) ? '#212121' : '#FFF';
	};

	var addRule = function(elem, styles) {
	    var rule = elem + " {";

	    angular.forEach(styles, function(style) {
	        rule += style[0] + ":" + style[1] + ";";
	    });
	    rule += "}";

	    return rule;
	};

	return {
		setColor: function(styles) {

			for(var style in styles) {
				switch (style) {
					case 'radius':
					case 'buttonRadius':
						break;
					default:
						styles[style] = '#' + styles[style];
						break;
				}
			}

		    var output = "";

		    if (styles.body) {
			    output += addRule('body', [
			        ["color", styles.body],
			    ]);
		    }

		    if (styles.radius) {
			    output += addRule('.element-wrap--select, .element-wrap input', [
			        ["border-radius", styles.radius],
			    ]);
		    }

		    if (styles.buttonRadius) {
			    output += addRule('.form-group--button button', [
			        ["border-radius", styles.buttonRadius],
			    ]);
		    }

		    if (styles.text) {
			    output += addRule('.form-group--button button', [
			        ["color", styles.text],
			    ]);
			}

			if (styles.buttonBg) {
			    output += addRule('.form-group--button button', [
			        ["background", styles.buttonBg]
			    ]);

			    output += addRule('.form-group--button button:hover, .form-group--button button:focus', [
			        ["background", shadeColor(styles.buttonBg, 10)]
			    ]);

			    output += addRule('.form-group--button button:active', [
			        ["background", shadeColor(styles.buttonBg, -6)]
			    ]);
			}

		    var sheet = document.createElement('style');

	    	sheet.innerHTML = output;

		    document.head.appendChild(sheet);
		}
	};
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
		getAjax: function(parameters) {
			var deferred = $q.defer();
			var queryStr = '?';
			var base = SessionService.affUrl ? 'http://' + SessionService.affUrl : "http://www.rentalcars.com";

			var page = "/InPathAjaxAction.do";

			if (SessionService.jsessionid !== undefined) page += ";jsessionid=" + SessionService.jessionid;

			queryStr += Object.keys(parameters).map(function(parameter) {
                return encodeURIComponent(parameter) + '=' + encodeURIComponent(parameters[parameter]);
	        }).join('&');

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
		addAjaxReq: "",
		styles: {}
	};

	var camelCase = function(parameter) {
	    return parameter.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
	        if (p2) return p2.toUpperCase();
	        return p1.toLowerCase();
	    });
	};

	for(var parameter in $location.search()) {
		if (parameter.indexOf('style-') === 0) {
			factory.styles[camelCase(parameter.substring(6))] = decodeURIComponent($location.search()[parameter]);
		} else {
			factory[camelCase(parameter)] = decodeURIComponent($location.search()[parameter]);
		}
	}

	factory.isRTL = (factory.preflang == 'he' || factory.preflang == 'ar') ? true : false;

	if (factory.hasOwnProperty('preflang')) factory.addAjaxReq += '&preflang=' + factory.preflang;
	if (factory.hasOwnProperty('affiliateCode')) factory.addAjaxReq += '&affiliateCode=' + factory.affiliateCode;
	if (factory.hasOwnProperty('prefcurrency')) factory.addAjaxReq += '&prefcurrency=' + factory.prefcurrency;
	if (factory.hasOwnProperty('cor')) factory.addAjaxReq += '&cor=' + factory.cor;

	factory.jsessionid = $cookies.JSESSIONID;

	return factory;

}]);