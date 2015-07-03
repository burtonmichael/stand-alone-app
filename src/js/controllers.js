angular.module('searchApp.controllers', ['ngRoute'])

.controller('MainCtrl', function($scope, $http, $location, $window, $modal, TranslationsService, TimeService) {

    $scope.params = $location.search();

    $scope.loading = {
        app: true
    };

    $scope.frame = "pickup";

    $scope.dateConfig = function(data) {
        var config = {
            format: data.format,
            i18n: data.i18n
        }

        var $pickup = $scope.form.pickup.date;
        var $dropoff = $scope.form.dropoff.date;

        $pickup._o = angular.extend({}, $pickup._o, config);
        $dropoff._o = angular.extend({}, $dropoff._o, config);

        var startDate = new Date();
        var endDate = new Date();
        endDate.setDate(startDate.getDate() + 3);

        $pickup.setStartRange(startDate);
        $pickup.setEndRange(endDate);

        $pickup.setMinDate(startDate);
        $dropoff.setMinDate(startDate);

        $dropoff.setStartRange(startDate);
        $dropoff.setEndRange(endDate);

        $pickup.setMoment(moment(startDate))
        $dropoff.setMoment(moment(endDate))
    }

    $scope.pickupDateChanged = function(date) {
        $scope.form.dropoff.date.setMinDate(date);
        var momentDate = moment(date);
        if (momentDate.isAfter($scope.form.dropoff.date.getMoment())) {
            $scope.form.dropoff.date.setMoment(momentDate)
            $scope.form.pickup.date.setEndRange(momentDate);
        }
        $scope.form.pickup.date.setStartRange(date);
        $scope.form.dropoff.date.setStartRange(date);
    }

    $scope.dropoffDateChanged = function(date) {
        $scope.form.pickup.date.setEndRange(date);
        $scope.form.dropoff.date.setEndRange(date);
    }

    $scope.submit = function() {
        $scope.errors = {};
        $scope.messages = [];

        var form = $scope.form;

        var pickupError = false;
        var dropoffError = false;

        if (!form.pickup.country) $scope.errors.country = pickupError = true;
        if (!form.pickup.city) $scope.errors.city = pickupError = true;
        if (!form.pickup.location) $scope.errors.location = pickupError = true;

        if (pickupError) $scope.messages.push('Pick up Location information is incomplete.')

        if (!form.dropoff.country) $scope.errors.dropCountry = dropoffError = true;
        if (!form.dropoff.city) $scope.errors.dropCity = dropoffError = true;
        if (!form.dropoff.location) $scope.errors.dropLocation = dropoffError = true;

        if (dropoffError) $scope.messages.push('Drop off location information is incomplete.')

        if (!form.age) {
            $scope.errors.age = true;
            $scope.messages.push('Enter driver\'s age.')
        }

        var pickupDateTime = form.pickup.date.getMoment();
        pickupDateTime.hour(form.pickup.hour.value);
        pickupDateTime.minute(form.pickup.minute.value);

        var dropoffDateTime = form.dropoff.date.getMoment();
        dropoffDateTime.hour(form.dropoff.hour.value);
        dropoffDateTime.minute(form.dropoff.minute.value);

        if (dropoffDateTime.diff(pickupDateTime, 'minutes') < 60) {
            $scope.errors.date = true;
            $scope.messages.push('There must be at least one hour between pick up and drop off.')
        }

        if ($scope.messages.length > 0) {
            var modal = $modal.open({
                animation: false,
                templateUrl: 'partials/modal.html',
                controller: 'modalCtrl',
                size: 'sm',
                resolve: {
                    messages: function() {
                        return $scope.messages;
                    }
                }
            });
        } else {
            $window.open('http://www.rentalcars.com')
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

.controller('modalCtrl', function ($scope, $modalInstance, messages) {

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
                country: $scope.form.pickup.country.id
            })
            .then(function(data) {
                $scope.loading.cities = null;
                $scope.cities = data;
                if (data.length == 1) {
                    $scope.form.pickup.city = data[0];
                    $scope.cityChanged();
                }
            });
    };

    $scope.cityChanged = function(preselect) {
        if ($scope.cities) {
            $scope.loading.locations = true;
            LocationService.getAjax({
                    country: $scope.form.pickup.country.id,
                    city: $scope.form.pickup.city.id
                })
                .then(function(data) {
                    $scope.loading.locations = null;
                    $scope.locations = data;
                    if (data.length == 1) {
                        $scope.form.pickup.location = data[0];
                        $scope.locationChanged();
                    }
                });
        }
    };

    $scope.locationChanged = function() {
        if ($scope.locations) {
            $scope.dropCountries = [$scope.form.pickup.country];
            $scope.form.dropoff.country = $scope.form.pickup.country;
            $scope.dropCities = angular.copy($scope.cities);
            $scope.form.dropoff.city = angular.copy($scope.form.pickup.city);
            $scope.dropLocations = angular.copy($scope.locations);
            $scope.form.dropoff.location = angular.copy($scope.form.pickup.location);
        }
    };

    $scope.dropCityChanged = function() {
        if ($scope.dropCities) {
            $scope.loading.dropLocations = true;
            LocationService.getAjax({
                    country: $scope.form.pickup.country.id,
                    city: $scope.form.dropoff.city.id
                })
                .then(function(data) {
                    $scope.loading.dropLocations = null;
                    $scope.dropLocations = data;
                    if (data.length == 1) {
                        $scope.form.dropoff.location = data[0];
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
            $scope.form.pickup.country = {
                id: $scope.params.country.split('+').join(' '),
                name: $scope.params.country.split('+').join(' ')
            }
            LocationService.getAjax({
                    country: $scope.form.pickup.country.id
                })
                .then(function(data) {
                    $scope.cities = data;
                    var found = $filter('filter')($scope.cities, {
                        name: $scope.params.city
                    }, true);
                    if ($scope.params.city && found) {
                        $scope.form.pickup.city = found[0]
                        LocationService.getAjax({
                                country: $scope.form.pickup.country.id,
                                city: $scope.form.pickup.city.id
                            })
                            .then(function(data) {
                                $scope.locations = data;
                                var found = $filter('filter')($scope.locations, {
                                    name: $scope.params.location
                                }, true);
                                if ($scope.params.location && found) {
                                    $scope.form.pickup.location = found[0];
                                    $scope.locationChanged();
                                } else {
                                    if (data.length == 1) {
                                        $scope.form.pickup.location = data[0];
                                        $scope.locationChanged();
                                    }
                                }
                            });
                    } else {
                        if (data.length == 1) {
                            $scope.form.pickup.city = data[0];
                            $scope.cityChanged();
                        }
                    }
                });
        }
    });

})
