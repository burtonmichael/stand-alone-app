angular.module('searchApp.controllers', ['ngRoute'])

.controller('HeadCtrl', function($scope, $location) {
    $scope.params = $location.search();

    if ($scope.params.css) {
        var baseUrl = 'css/import/';
        var exports = [];
        var stylesheets = $scope.params.css.split('+');
        angular.forEach(stylesheets, function(stylesheet) {
            this.push(baseUrl + stylesheet + '.css')
        }, exports)
        $scope.stylesheets = exports;
    }
})

.controller('MainCtrl', function($scope, $http, $location, $window, $modal, TranslationsService) {
    
    $scope.params = $location.search();

    $scope.form = {
        emptySearchResults: true,
        fromLocChoose: true
    }

    $scope.loading = {
        app: true
    };

    $scope.frame = "pickup";

    $scope.dateConfig = function(data) {

        moment.defineLocale("preflang", data.moment)

        moment.locale("preflang");

        var $pickup = $scope.pikaday.pickup;
        var $dropoff = $scope.pikaday.dropoff;

        var i18n = {
            previousMonth: data.previousMonth,
            nextMonth: data.nextMonth,
            months: data.moment.months,
            monthsShort: data.moment.monthsShort,
            weekdays: data.moment.weekdays,
            weekdaysShort: data.moment.weekdaysShort
        }

        $pickup._o.i18n = i18n;
        $dropoff._o.i18n = i18n;

        $pickup._o.format = $scope.params.format ? $scope.params.format.split('+').join(' ') : 'L';
        $dropoff._o.format = $scope.params.format ? $scope.params.format.split('+').join(' ') : 'L';

        var startDate = new Date();
        var endDate = new Date();
        endDate.setDate(startDate.getDate() + 3);

        $pickup.setMoment(moment(startDate));
        $dropoff.setMoment(moment(endDate));

        $pickup.setMinDate(startDate);
        $dropoff.setMinDate(startDate);

        $pickup.setStartRange(startDate);
        $pickup.setEndRange(endDate);

        $dropoff.setStartRange(startDate);
        $dropoff.setEndRange(endDate);
    }

    $scope.dateChanged = function(origin, date, pikaday) {
        if (origin === 'pickup') {
            var momentDate = moment(date);
            if (momentDate.isAfter($scope.pikaday.dropoff.getMoment())) {
                $scope.pikaday.pickup.setEndRange(date);
                $scope.pikaday.dropoff.setMoment(momentDate);
            }
            $scope.pikaday.dropoff.setMinDate(date);
            $scope.pikaday.pickup.setStartRange(date);
            $scope.pikaday.dropoff.setStartRange(date);
        }

        if (origin === 'dropoff') {
            $scope.pikaday.pickup.setEndRange(date);
            $scope.pikaday.dropoff.setEndRange(date);
        }
    }

    $scope.submit = function() {
        $scope.errors = {};
        $scope.messages = [];

        var form = $scope.form;

        var pickupError = false;
        var dropoffError = false;

        if (!form.country) $scope.errors.country = pickupError = true;
        if (!form.city) $scope.errors.city = pickupError = true;
        if (!form.location) $scope.errors.location = pickupError = true;

        if (pickupError) $scope.messages.push('Pick up Location information is incomplete.')

        if (!form.dropCountry) $scope.errors.dropCountry = dropoffError = true;
        if (!form.dropCity) $scope.errors.dropCity = dropoffError = true;
        if (!form.dropLocation) $scope.errors.dropLocation = dropoffError = true;

        if (dropoffError) $scope.messages.push('Drop off location information is incomplete.')

        if (!form.driversAge) {
            $scope.errors.driversAge = true;
            $scope.messages.push('Enter driver\'s age.')
        }

        var pickupDateTime = $scope.pikaday.pickup.getMoment().hour(form.puHour).minute(form.puMinute);

        var dropoffDateTime = $scope.pikaday.dropoff.getMoment().hour(form.doHour).minute(form.doMinute);

        if (dropoffDateTime.diff(pickupDateTime, 'minutes') < 60) {
            $scope.errors.date = true;
            $scope.messages.push('There must be at least one hour between pick up and drop off.')
        } else {
            form.puDay = pickupDateTime.date();
            form.puMonth = pickupDateTime.month() + 1;
            form.puYear = pickupDateTime.year();

            form.puDay = dropoffDateTime.date();
            form.puMonth = dropoffDateTime.month() + 1;
            form.puYear = dropoffDateTime.year();
        }

        if ($scope.messages.length > 0) {
            var modal = $modal.open({
                animation: false,
                templateUrl: 'partials/modal.html',
                controller: 'ModalCtrl',
                size: 'sm',
                resolve: {
                    messages: function() {
                        return $scope.messages;
                    }
                }
            });
        } else {
            parameters = Object.keys(form).map(function(k) {
                if (typeof form[k] === 'object') {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(form[k].id)
                } else {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(form[k])
                }
            }).join('&')
            $window.open('http://www.rentalcars.com/LoadingSearchResults.do?' + parameters)
        }
    }

    TranslationsService.getDefault()
        .then(function(defaultData) {
            if ($scope.params.messages) {
                TranslationsService.getCustom($scope.params.messages)
                    .then(function(customData) {
                        var customData = angular.extend({}, defaultData, customData);
                        $scope.translations = customData
                        $scope.dateConfig(customData);
                        $scope.loading.app = false;
                    });
            } else {
                $scope.translations = defaultData;
                $scope.dateConfig(defaultData);
                $scope.loading.app = false;
            }
        });
})

.controller('ModalCtrl', function ($scope, $modalInstance, messages) {

  $scope.messages = messages;

  $scope.close = function () {
    $modalInstance.close();
  };
})

.controller('LocaleCtrl', function($scope, $filter, LocationService, SessionService) {

    $scope.localeChanged = function(level) {
        $scope.clearFields(level);
        switch (level) {
            case "country":
                $scope.countryChanged();
                break;
            case "city":
                $scope.cityChanged();
                break;
            case "location":
                $scope.locationChanged();
                break;
            case "dropCity":
                $scope.dropCityChanged();
                break;
        }

    }

    $scope.countryChanged = function(preselect) {
        $scope.loading.cities = true;
        LocationService.getAjax({
                country: $scope.form.country.id
            })
            .then(function(data) {
                $scope.loading.cities = null;
                $scope.cities = data;
                if (data.length == 1) {
                    $scope.form.city = data[0];
                    $scope.cityChanged();
                }
            });
    };

    $scope.cityChanged = function(preselect) {
        if ($scope.cities) {
            $scope.loading.locations = true;
            LocationService.getAjax({
                    country: $scope.form.country.id,
                    city: $scope.form.city.id
                })
                .then(function(data) {
                    $scope.loading.locations = null;
                    $scope.locations = data;
                    if (data.length == 1) {
                        $scope.form.location = data[0];
                        $scope.locationChanged();
                    }
                });
        }
    };

    $scope.locationChanged = function() {
        if ($scope.locations) {
            $scope.dropCountries = [$scope.form.country];
            $scope.form.dropCountry = $scope.form.country;
            $scope.dropCities = angular.copy($scope.cities);
            $scope.form.dropCity = angular.copy($scope.form.city);
            $scope.dropLocations = angular.copy($scope.locations);
            $scope.form.dropLocation = angular.copy($scope.form.location);
        }
    };

    $scope.dropCityChanged = function() {
        if ($scope.dropCities) {
            $scope.loading.dropLocations = true;
            LocationService.getAjax({
                    country: $scope.form.country.id,
                    city: $scope.form.dropCity.id
                })
                .then(function(data) {
                    $scope.loading.dropLocations = null;
                    $scope.dropLocations = data;
                    if (data.length == 1) {
                        $scope.form.dropLocation = data[0];
                    }
                });
        }
    };

    $scope.clearFields = function(field) {
        switch (field) {
            case "country":
                $scope.cities = null;
            case "city":
                $scope.locations = null;
            case "location":
                $scope.dropCountries = null;
                $scope.dropCities = null;
            case "dropCity":
                $scope.dropLocations = null;
        }
    }

    LocationService.getCountries().then(function(data) {
        $scope.countries = data;

        if ($scope.params.country && ($filter('filter')($scope.countries, {
                name: $scope.params.country
            }, true).length > 0)) {
            $scope.form.country = {
                id: $scope.params.country.split('+').join(' '),
                name: $scope.params.country.split('+').join(' ')
            }
            LocationService.getAjax({
                    country: $scope.form.country.id
                })
                .then(function(data) {
                    $scope.cities = data;
                    var found = $filter('filter')($scope.cities, {
                        name: $scope.params.city
                    }, true);
                    if ($scope.params.city && found) {
                        $scope.form.city = found[0]
                        LocationService.getAjax({
                                country: $scope.form.country.id,
                                city: $scope.form.city.id
                            })
                            .then(function(data) {
                                $scope.locations = data;
                                var found = $filter('filter')($scope.locations, {
                                    name: $scope.params.location
                                }, true);
                                if ($scope.params.location && found) {
                                    $scope.form.location = found[0];
                                    $scope.locationChanged();
                                } else {
                                    if (data.length == 1) {
                                        $scope.form.location = data[0];
                                        $scope.locationChanged();
                                    }
                                }
                            });
                    } else {
                        if (data.length == 1) {
                            $scope.form.city = data[0];
                            $scope.cityChanged();
                        }
                    }
                });
        }
    });

})