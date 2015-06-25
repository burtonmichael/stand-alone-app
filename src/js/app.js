var searchApp = angular.module('searchApp',
    ['ngRoute',
     'ngSanitize',
     'searchApp.services',
     'searchApp.directives',
     'searchApp.filters',
     'searchApp.controllers'])

.config(function($routeProvider, $locationProvider) {

	$routeProvider

	.when('/', {
		templateUrl: 'partials/locations.html',
		controller: 'LocaleCtrl',
		controllerAs: 'locale',
		resolve: {
			preloadData: function($q, LocationService){
				return $q.all([
					LocationService.getCountries()
				]);
			}
		}
	})

	.otherwise({
		redirectTo: '/'
	});
});
