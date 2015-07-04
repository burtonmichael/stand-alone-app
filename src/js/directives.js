angular.module('searchApp.directives', [])

.directive('number', function(){
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

.directive('pickupCountry', function(){
  return {
    controller: 'LocaleCtrl',
    templateUrl: 'partials/locale/pickup-country.html'
  }
})

.directive('pickupCity', function(){
  return {
    controller: 'LocaleCtrl',
    templateUrl: 'partials/locale/pickup-city.html'
  }
})

.directive('pickupLocation', function(){
  return {
    controller: 'LocaleCtrl',
    templateUrl: 'partials/locale/pickup-location.html'
  }
})

.directive('dropoffCountry', function(){
  return {
    controller: 'LocaleCtrl',
    templateUrl: 'partials/locale/dropoff-country.html'
  }
})

.directive('dropoffCity', function(){
  return {
    controller: 'LocaleCtrl',
    templateUrl: 'partials/locale/dropoff-city.html'
  }
})

.directive('dropoffLocation', function(){
  return {
    controller: 'LocaleCtrl',
    templateUrl: 'partials/locale/dropoff-location.html'
  }
})

.directive('hours', function(){
  return {
    scope: {
      selectedHour: "="
    },
    controller: function($scope, TimeService) {
      $scope.hours = TimeService.getHours();
    },
    templateUrl: 'partials/hours.html'
  }
})

.directive('minutes', function(){
  return {
    scope: {
      selectedMinute: "="
    },
    controller: function($scope, TimeService) {
      $scope.minutes = TimeService.getMinutes();
    },
    templateUrl: 'partials/minutes.html'
  }
})