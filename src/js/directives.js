angular.module('searchApp.directives', [])

.directive('pickupLocaleSelection', function() {
    return {
        controller: 'LocaleCtrl',
        restrict: 'A',
        templateUrl: 'partials/pickupLocale.html',
        replace: true
    };
})

.directive('dropoffLocaleSelection', function() {
    return {
        controller: 'LocaleCtrl',
        restrict: 'A',
        templateUrl: 'partials/dropoffLocale.html',
        replace: true
    };
})

.directive('numbersOnly', function(){
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
       modelCtrl.$parsers.push(function (inputValue) {
           if (inputValue == undefined) return '';
           var transformedInput = inputValue.replace(/[^0-9]/g, ''); 
           if (transformedInput != inputValue) {
              modelCtrl.$setViewValue(transformedInput);
              modelCtrl.$render();
           }

           return transformedInput;         
       });
     }
   };
})