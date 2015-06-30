angular.module('searchApp.directives', [])

.directive('pickupLocaleSelection', function(){
    // Runs during compile
    return {
        controller: 'LocaleCtrl',
        restrict: 'A',
        templateUrl: 'partials/pickupLocale.html',
        replace: true
    };
})

.directive('dropoffLocaleSelection', function(){
    // Runs during compile
    return {
        controller: 'LocaleCtrl',
        restrict: 'A',
        templateUrl: 'partials/dropoffLocale.html',
        replace: true
    };
})