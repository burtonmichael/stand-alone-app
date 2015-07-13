var searchApp = angular.module('searchApp', ['ngRoute',
    'ui.bootstrap',
    'pikaday',
    'searchApp.services',
    'searchApp.directives',
    'searchApp.filters',
    'searchApp.controllers'
])

.config(['$routeProvider', '$locationProvider', '$provide', function($routeProvider, $locationProvider, $provide) {
    $routeProvider.
    when('/', {
        controller: 'MainCtrl',
        templateUrl: 'partials/search-panel.html'
    });

    $locationProvider.html5Mode(true);

    $provide.decorator("$browser", ["$delegate", function($delegate) {
            var superUrl;
            superUrl = $delegate.url;
            $delegate.url = function(url, replace) {
                if (url !== 'undefined') {
                    return superUrl().replace(/\+/g, "%2B");
                }
            };
            return $delegate;
        }
    ]);
}]);
