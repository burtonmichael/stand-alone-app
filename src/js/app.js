var searchApp = angular.module('searchApp', ['ngRoute',
    'ui.bootstrap',
    'searchApp.services',
    'searchApp.directives',
    'searchApp.filters',
    'searchApp.controllers'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'MainCtrl',
            templateUrl: 'partials/layout/core.html',
            resolve: {
                translations: function(TranslationsService) {
                    return TranslationsService.get();
                }
            }
        })
        .otherwise({
            redirectTo: '/'
        });
}]);
