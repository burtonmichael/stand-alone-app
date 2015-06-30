var searchApp = angular.module('searchApp', ['ngRoute',
    'pikaday',
    'ngSanitize',
    'searchApp.services',
    'searchApp.directives',
    'searchApp.filters',
    'searchApp.controllers'
])

.config(['$locationProvider', function($locationProvider) {

    $locationProvider.html5Mode(true);

}])
