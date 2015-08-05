var searchApp = angular.module('searchApp', ['ngRoute',
    'ui.bootstrap',
    'searchApp.services',
    'searchApp.directives',
    'searchApp.filters',
    'searchApp.controllers'
])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            controller: 'MainCtrl',
            templateUrl: 'partials/layout/core.html',
            resolve: {
                translations: ["TranslationsService", function(TranslationsService) {
                    return TranslationsService.get();
                }]
            }
        })
        .otherwise({
            redirectTo: '/'
        });

    if (window.history && window.history.pushState) $locationProvider.html5Mode(true);
}]);
