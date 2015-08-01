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
            onClose: '&'
        },
        link: function(scope, elem, attrs) {

            var config = {
                field: elem[0],
                setDefaultDate: true,
                format: 'L',
                position: 'top left',
                onSelect: function() {
                    setTimeout(function() {
                        scope.$apply();
                    });
                },
                onDraw: function() {
                    if (parseInt(picker.el.style.top) < 0) picker.el.style.top = '0px';
                }
            };

            angular.forEach(attrs.$attr, function(dashAttr) {
                var attr = attrs.$normalize(dashAttr);
                applyConfig(attr, attrs[attr]);
            });

            function applyConfig(attr, value) {
                switch (attr) {
                    case "isRTL":
                    case "i18n":
                        config[attr] = scope.$eval(value);
                        break;
                    case "onSelect":
                    case "onClose":
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
                    case "defaultDate":
                    case "minDate":
                        config[attr] = new Date(scope.$eval(value));
                        break;
                    case "startRange":
                    case "endRange":
                        var date = new Date(scope.$eval(value));
                        config[attr] = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        break;
                }
            }

            var picker = new Pikaday(config);
            picker.setDate(config.defaultDate, true);
            picker.setStartRange(config.startRange);
            picker.setEndRange(config.endRange);
            scope.pikaday = picker;
            scope.$on('$destroy', function() {
                picker.destroy();
            });
        }
    };
});
