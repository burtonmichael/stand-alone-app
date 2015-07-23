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
							return angular.extend({}, data[0].data, data[1].data);
						});
				} else {
					promise = $http.get("/stand-alone-locale/translations/" + SessionService.preflang + ".json")
						.then(function(resp) {
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

	factory = angular.extend({}, factory, $location.search());

	factory.isRTL = (factory.preflang == 'he' || factory.preflang == 'ar') ? true : false;

	if (factory.hasOwnProperty('preflang')) factory.addAjaxReq += '&preflang=' + factory.preflang;
	if (factory.hasOwnProperty('affiliateCode')) factory.addAjaxReq += '&affiliateCode=' + factory.affiliateCode;
	if (factory.hasOwnProperty('prefcurrency')) factory.addAjaxReq += '&prefcurrency=' + factory.prefcurrency;
	if (factory.hasOwnProperty('cor')) factory.addAjaxReq += '&cor=' + factory.cor;

	factory.jsessionid = $cookies.JSESSIONID;

	return factory;

}]);