angular.module('searchApp.services', ['ngCookies'])

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
			for(var prop in params) {
				queryStr += prop + '=' + params[prop] + '&';
			}
			queryStr += 'wrapNonAirports=true&preflang=' + SessionService.preflang;
			$http({
				method: "GET",
				url: "/AjaxDroplists.do;jsessionid=" + SessionService.jsessionid + queryStr
			})
				.success(function(data) {
					SessionService.jsessionid = $cookies['JSESSIONID'];
					deferred.resolve(data);
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
		get: function(preflang) {
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
		preflang: "en"
	}

	var tj_conf = $cookies['tj_conf'] ? $cookies['tj_conf'].slice(1, -1).split('|') : [];

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

	var queryString;

	if ($window.location.search) {
		queryString = $window.location.search.substring(1);
	} else if ($window.location.hash) {
		queryString = $window.location.hash.substring($window.location.hash.indexOf('?') + 1);
	} else {
		queryString = '';
	}

	var pairs = queryString.split('&');

	for (var i = 0; i < pairs.length; i++) {
		var pairVals = pairs[i].split('=');
		factory[pairVals[0]] = pairVals[1];
	}

	factory.jsessionid = $cookies['JSESSIONID'] || '';

	return factory;

})