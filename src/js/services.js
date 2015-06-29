angular.module('searchApp.services', ['ngCookies'])

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
	    		})
	    	};

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
	    		})
	    	};

	    	return minutes;
		}
	};
})

.factory('LocationService', function($q, $http, $cookies, SessionService){
	return {
		getCountries: function() {
			var deferred = $q.defer();
			$http({
				method: "GET",
				url: "js/data/locations/" + SessionService.preflang + ".json"
			})
				.success(function(data) {
					deferred.resolve(data);
				})
			return deferred.promise;
		},
		getAjax: function(params) {
			var deferred = $q.defer();
			var queryStr = '?'
			var baseUrl = "http://www.rentalcars.com/InPathAjaxAction.do";

			if (SessionService.jessionid) baseUrl += ";jsessionid=" + SessionService.jessionid;

			for(var prop in params) {
				queryStr += prop + '=' + decodeURIComponent(params[prop]) + '&';
			}
			queryStr += 'wrapNonAirports=true&preflang=' + SessionService.preflang + SessionService.addAjaxReq;
			$http({
				method: "GET",
				url: "http://www.rentalcars.com/InPathAjaxAction.do;jsessionid=" + SessionService.jsessionid + queryStr
			})
				.success(function(data) {
					SessionService.jsessionid = $cookies.get('JSESSIONID');
					deferred.resolve(data.cityList || data.locationList);
				})
				.error(function(data) {
					deferred.resolve(false);
				})
			return deferred.promise;
		}
	}
})

.factory('TranslationsService', function($q, $http, SessionService){
	return {
		get: function() {
			var deferred = $q.defer();
			$http({
				method: "GET",
				url: "js/data/translations/" + SessionService.preflang + ".json"
			})
				.success(function(data) {
					deferred.resolve(data);
				})
			return deferred.promise;
		}
	}
})

.factory('SessionService', function($window, $cookies){

	var factory = {
		preflang: "en",
		addAjaxReq: ""
	}

	var tj_conf = $cookies.get('tj_conf');

	var tj_conf = tj_conf ? tj_conf.slice(1, -1).split('|') : [];

	for (var i = tj_conf.length - 1; i >= 0; i--) {
		var item = tj_conf[i].split(':');
		switch(item[0]) {
			case 'tj_pref_currency':
				factory.prefcurrency = item[1];
				break;
			case 'tj_pref_lang':
				factory.preflang = item[1];
				break;
			case 'tj_pref_currency':
				factory.cor = item[1];
				break;
			default:
				factory[item[0]] = item[1];
				break;
		}
	};

	var queryString = '';

	if ($window.location.search) {
		queryString = $window.location.search.substring(1);
	} else if ($window.location.hash) {
		queryString = $window.location.hash.substring($window.location.hash.indexOf('?') + 1);
	}

	var pairs = queryString.split('&');

	for (var i = 0; i < pairs.length; i++) {
		var pairVals = pairs[i].split('=');
		factory[pairVals[0]] = pairVals[1];
		if (pairVals[0] === 'prefcurrency') factory.addAjaxReq += '&prefcurrency=' + pairVals[1];
		if (pairVals[0] === 'cor') factory.addAjaxReq += '&cor=' + pairVals[1];
	}

	factory.jsessionid = $cookies.get('JSESSIONID');

	return factory;

})