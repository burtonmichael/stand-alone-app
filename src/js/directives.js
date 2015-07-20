angular.module('searchApp.directives', [])

.directive('number', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function(inputValue) {
                if (inputValue === undefined) return '';
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

.directive('searchPanel', function() {
    return {
        scope: {
            translations: '=',
            loading: '='
        },
        controller: 'SearchPanelCtrl',
        templateUrl: 'partials/search-panel.html'
    };
})

.directive('selectReplace', function() {
    return {
        link: function(scope, elem, attrs) {
            var sel = elem.find('select');

            if (attrs.selectReplace) {
                scope.$watch(attrs.selectReplace, function(newVal, oldVal) {
                    if (newVal) {
                        sel.removeAttr('disabled');
                        elem.removeClass('is-disabled');
                    } else {
                        sel.attr('disabled', 'disabled');
                        elem.addClass('is-disabled');
                    }
                });
            }

            sel.bind('focus', function() {
                elem.addClass('has-focus');
            });
            sel.bind('blur', function() {
                elem.removeClass('has-focus');
            });
        }
    };
})

.directive('pickupCountry', function() {
    return {
        templateUrl: 'partials/locale/pickup-country.html'
    };
})

.directive('pickupCity', function() {
    return {
        templateUrl: 'partials/locale/pickup-city.html'
    };
})

.directive('pickupLocation', function() {
    return {
        templateUrl: 'partials/locale/pickup-location.html'
    };
})

.directive('dropoffCountry', function() {
    return {
        templateUrl: 'partials/locale/dropoff-country.html'
    };
})

.directive('dropoffCity', function() {
    return {
        templateUrl: 'partials/locale/dropoff-city.html'
    };
})

.directive('dropoffLocation', function() {
    return {
        templateUrl: 'partials/locale/dropoff-location.html'
    };
})

.directive('hours', function() {
    return {
        scope: {
            selectedHour: "="
        },
        controller: ['$scope', 'TimeService', function($scope, TimeService) {
            $scope.hours = TimeService.getHours();
        }],
        templateUrl: 'partials/hours.html'
    };
})

.directive('minutes', function() {
    return {
        scope: {
            selectedMinute: "="
        },
        controller: ['$scope', 'TimeService', function($scope, TimeService) {
            $scope.minutes = TimeService.getMinutes();
        }],
        templateUrl: 'partials/minutes.html'
    };
});
