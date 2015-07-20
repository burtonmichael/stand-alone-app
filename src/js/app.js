var searchApp = angular.module('searchApp', ['ngRoute',
    'ui.bootstrap',
    'pikaday',
    'searchApp.services',
    'searchApp.directives',
    'searchApp.filters',
    'searchApp.controllers'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'MainCtrl',
            templateUrl: 'partials/layout/core.html'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);
