var searchApp = angular.module('searchApp', ['ngRoute',
	'ui.bootstrap',
    'pikaday',
    'searchApp.services',
    'searchApp.directives',
    'searchApp.filters',
    'searchApp.controllers'
])

.config(['$locationProvider', function($locationProvider) {

    $locationProvider.html5Mode(true);

}])
