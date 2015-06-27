var searchApp = angular.module('searchApp', ['ngRoute',
    'pikaday',
    'ngSanitize',
    'searchApp.services',
    'searchApp.directives',
    'searchApp.filters',
    'searchApp.controllers'
])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider

        .when('/', {
        templateUrl: 'partials/locations.html',
        controller: 'LocaleCtrl',
        controllerAs: 'locale',
        resolve: {
            countries: function(LocationService) {
            	console.log($locationProvider)
                return LocationService.getCountries();
            }
        }

    })

    .otherwise({
        redirectTo: '/'
    });

    $locationProvider.html5Mode(true);

}])
