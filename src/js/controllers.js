angular.module('searchApp.controllers', ['ngRoute'])

.controller('MainCtrl', function($scope, $http, $location, $window, TranslationsService, TimeService) {

    $scope.params = $location.search();

    $scope.loading = {};

    $scope.loading.app = true;

    $scope.messages;

    $scope.age = 25;

    $scope.hours = TimeService.getHours();
    $scope.minutes = TimeService.getMinutes();

    $scope.frame = "pickup";

    $scope.changeDate = function() {
        var date = new Date;
        date.setDate(date.getDate() + 19)
        $scope.pikaday.pickup.setDate(date)
    }

    $scope.dateConfig = function(data) {
        var config = {
            format: data.format,
            i18n: data.i18n
        }
        $scope.pickup.date._o = angular.extend({}, $scope.pickup.date._o, config);
        $scope.dropoff.date._o = angular.extend({}, $scope.dropoff.date._o, config);

        $scope.pickup.date.setMoment(moment())
        $scope.dropoff.date.setMoment(moment().add(3, 'days'))
    }

    $scope.dateChanged = function(date) {
        $scope.dropoff.date.setMinDate(date)
        if (moment(date).isAfter($scope.dropoff.date.getMoment())) {
            $scope.dropoff.date.setMoment(moment(date))
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
                country: $scope.pickup.country.id
            })
            .then(function(data) {
                $scope.loading.cities = null;
                $scope.pickup.cities = data;
                if (data.length == 1) {
                    $scope.pickup.city = data[0];
                    $scope.cityChanged();
                }
            });
    };

    $scope.cityChanged = function(preselect) {
        if ($scope.pickup.cities) {
            $scope.loading.locations = true;
            LocationService.getAjax({
                    country: $scope.pickup.country.id,
                    city: $scope.pickup.city.id
                })
                .then(function(data) {
                    $scope.loading.locations = null;
                    $scope.pickup.locations = data;
                    if (data.length == 1) {
                        $scope.pickup.location = data[0];
                        $scope.locationChanged();
                    }
                });
        }
    };

    $scope.locationChanged = function() {
        if ($scope.pickup.locations) {
            $scope.dropoff.countries = [$scope.pickup.country];
            $scope.dropoff.country = $scope.pickup.country;
            $scope.dropoff.cities = angular.copy($scope.pickup.cities);
            $scope.dropoff.city = angular.copy($scope.pickup.city);
            $scope.dropoff.locations = angular.copy($scope.pickup.locations);
            $scope.dropoff.location = angular.copy($scope.pickup.location);
        }
    };

    $scope.dropCityChanged = function() {
        $scope.loading.dropLocations = true;
        LocationService.getAjax({
                country: $scope.pickup.country.id,
                city: $scope.dropoff.city.id
            })
            .then(function(data) {
                $scope.loading.dropLocations = null;
                $scope.dropoff.locations = data;
                if (data.length == 1) {
                    $scope.dropoff.location = data[0];
                }
            });
    };

    $scope.clearFields = function(field) {
        switch (field) {
            case "country":
                $scope.pickup.cities = null;
            case "city":
                $scope.pickup.locations = null;
            case "location":
                $scope.dropoff.countries = null;
                $scope.dropoff.cities = null;
            case "dropCity":
                $scope.dropoff.locations = null;
        }
    }

    LocationService.getCountries().then(function(data) {
        $scope.pickup.countries = data;

        if ($scope.params.country && ($filter('filter')($scope.pickup.countries, {
                name: $scope.params.country
            }, true).length > 0)) {
            $scope.pickup.country = {
                id: $scope.params.country.split('+').join(' '),
                name: $scope.params.country.split('+').join(' ')
            }
            LocationService.getAjax({
                    country: $scope.pickup.country.id
                })
                .then(function(data) {
                    $scope.pickup.cities = data;
                    var found = $filter('filter')($scope.pickup.cities, {
                        name: $scope.params.city
                    }, true);
                    if ($scope.params.city && found) {
                        $scope.pickup.city = found[0]
                        LocationService.getAjax({
                                country: $scope.pickup.country.id,
                                city: $scope.pickup.city.id
                            })
                            .then(function(data) {
                                $scope.pickup.locations = data;
                                var found = $filter('filter')($scope.pickup.locations, {
                                    name: $scope.params.location
                                }, true);
                                if ($scope.params.location && found) {
                                    $scope.pickup.location = found[0];
                                    $scope.locationChanged();
                                } else {
                                    if (data.length == 1) {
                                        $scope.pickup.location = data[0];
                                        $scope.locationChanged();
                                    }
                                }
                            });
                    } else {
                        if (data.length == 1) {
                            $scope.pickup.city = data[0];
                            $scope.cityChanged();
                        }
                    }
                });
        }
    });

})
