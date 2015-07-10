var searchApp = angular.module('searchApp', ['ngRoute',
    'ui.bootstrap',
    'pikaday',
    'searchApp.services',
    'searchApp.directives',
    'searchApp.filters',
    'searchApp.controllers'
])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
	when('/', {
		controller: 'MainCtrl',
		templateUrl: 'partials/search-panel.html'
	})

	$locationProvider.html5Mode(true);
}])