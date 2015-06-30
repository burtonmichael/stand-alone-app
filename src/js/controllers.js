angular.module('searchApp.controllers', ['ngRoute'])

.controller('MainCtrl', function($scope, TranslationsService, TimeService) {

    $scope.pickup = {};
    $scope.dropoff = {};

    $scope.hours = TimeService.getHours();
    $scope.minutes = TimeService.getMinutes();

    $scope.frame = "pickup";

    TranslationsService.get()
        .then(function(data) {
            $scope.translations = data
        });
})

.controller('LocaleCtrl', function($scope, $location, $filter, LocationService, SessionService) {

    $scope.loading = {};

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
    };

    $scope.locationChanged = function() {
        $scope.dropoff.countries = [$scope.pickup.country];
        $scope.dropoff.country = $scope.pickup.country;
        $scope.dropoff.cities = angular.copy($scope.pickup.cities);
        $scope.dropoff.city = angular.copy($scope.pickup.city);
        $scope.dropoff.locations = angular.copy($scope.pickup.locations);
        $scope.dropoff.location = angular.copy($scope.pickup.location);
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

        var params = $location.search();

        if (params.country && ($filter('filter')($scope.pickup.countries, {
                name: params.country
            }, true).length > 0)) {
            $scope.pickup.country = {
                id: params.country.split('+').join(' '),
                name: params.country.split('+').join(' ')
            }
            LocationService.getAjax({
                    country: $scope.pickup.country.id
                })
                .then(function(data) {
                    $scope.pickup.cities = data;
                    var found = $filter('filter')($scope.pickup.cities, {
                        name: params.city
                    }, true);
                    if (params.city && found) {
                        $scope.pickup.city = found[0]
                        LocationService.getAjax({
                                country: $scope.pickup.country.id,
                                city: $scope.pickup.city.id
                            })
                            .then(function(data) {
                                $scope.pickup.locations = data;
                                var found = $filter('filter')($scope.pickup.locations, {
                                    name: params.location
                                }, true);
                                if (params.location && found) {
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