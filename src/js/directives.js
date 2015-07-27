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
})

.directive('pikaday', function() {
    return {
        restrict: 'A',
        scope: {
            pikaday: '=',
            onSelect: '&',
            onOpen: '&',
            onClose: '&',
            onDraw: '&',
            disableDayFn: '&'
        },
        link: function(scope, elem, attrs) {

            // Init config Object

            var config = {
                field: elem[0],
                onSelect: function() {
                    setTimeout(function() {
                        scope.$apply();
                    });
                }
            };

            // Decorate/Overide config with inline attributes

            angular.forEach(attrs.$attr, function(dashAttr) {
                var attr = attrs.$normalize(dashAttr); // normalize = ToCamelCase()
                applyConfig(attr, attrs[attr]);
            });

            function applyConfig(attr, value) {
                switch (attr) {

                    // Booleans, Integers & Arrays

                    case "setDefaultDate":
                    case "bound":
                    case "reposition":
                    case "disableWeekends":
                    case "showWeekNumber":
                    case "isRTL":
                    case "showMonthAfterYear":
                    case "firstDay":
                    case "yearRange":
                    case "numberOfMonths":
                    case "mainCalendar":
                    case "i18n":

                        config[attr] = scope.$eval(value);
                        break;

                        // Functions

                    case "onSelect":
                    case "onOpen":
                    case "onClose":
                    case "onDraw":
                    case "disableDayFn":

                        config[attr] = function(date) {
                            setTimeout(function() {
                                scope.$apply();
                            });
                            return scope[attr]({
                                pikaday: this,
                                date: date
                            });
                        };
                        break;

                        // Strings

                    case "format":
                    case "position":
                    case "theme":
                    case "yearSuffix":

                        config[attr] = value;
                        break;

                        // Dates

                    case "minDate":
                    case "maxDate":
                    case "defaultDate":

                        config[attr] = new Date(scope.$eval(value));
                        break;

                        // Elements

                    case "trigger":
                    case "container":

                        config[attr] = document.getElementById(value);
                        break;

                }
            }

            // instantiate pikaday with config, bind to scope, add destroy event callback
            var picker = new Pikaday(config);
            scope.pikaday = picker;
            scope.$on('$destroy', function() {
                picker.destroy();
            });
        }
    };
});
