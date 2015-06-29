angular.module('searchApp.controllers', ['ngRoute'])

.controller('MainCtrl', function(TranslationsService) {
    var app = this;

    app.pickup = {};
    app.dropoff = {};

    app.frame = "pickup";

    TranslationsService.get()
        .then(function(data) {
            app.translations = data
        });

    app.puSelect = function(pikaday) {
        var date = pikaday.getDate();
        app.pickup.day = date.getDate();
        app.pickup.month = date.getMonth() + 1;
        app.pickup.year = date.getFullYear();
    }

    app.doSelect = function(pikaday) {
        var date = pikaday.getDate();
        app.dropoff.day = date.getDate();
        app.dropoff.month = date.getMonth() + 1;
        app.dropoff.year = date.getFullYear();
    }
})

.controller('LocaleCtrl', function($route, $filter, countries, LocationService, SessionService) {

    var app = this;

    app.countries = countries;

    app.loading = {};

    app.localeChanged = function(level) {
        app.clearFields(level);
        switch (level) {
            case "country":
                app.countryChanged();
                break;
            case "city":
                app.cityChanged();
                break;
            case "location":
                app.locationChanged();
                break;
            case "dropCity":
                app.dropCityChanged();
                break;
        }

    }

    app.countryChanged = function(preselect) {
        app.loading.cities = true;
        LocationService.getAjax({
                country: app.countries.selected.id
            })
            .then(function(data) {
                app.loading.cities = null;
                app.cities = data;
                if (data.length == 1) {
                    app.cities.selected = data[0];
                    app.cityChanged();
                }
            });
    };

    app.cityChanged = function(preselect) {
        app.loading.locations = true;
        LocationService.getAjax({
                country: app.countries.selected.id,
                city: app.cities.selected.id
            })
            .then(function(data) {
                app.loading.locations = null;
                app.locations = data;
                if (data.length == 1) {
                    app.locations.selected = data[0];
                    app.locationChanged();
                }
            });
    };

    app.locationChanged = function() {
        app.dropCountries = [app.countries.selected];
        app.dropCountries.selected = app.countries.selected;
        app.dropCities = angular.copy(app.cities);
        app.dropCities.selected = angular.copy(app.cities.selected);
        app.dropLocations = angular.copy(app.locations);
        app.dropLocations.selected = angular.copy(app.locations.selected);
    };

    app.dropCityChanged = function() {
        app.loading.dropLocations = true;
        LocationService.getAjax({
                country: app.countries.selected.id,
                city: app.dropCities.selected.id
            })
            .then(function(data) {
                app.loading.dropLocations = null;
                app.dropLocations = data;
                if (data.length == 1) {
                    app.dropLocations.selected = data[0];
                }
            });
    };

    app.clearFields = function(field) {
        switch (field) {
            case "country":
                app.cities = null;
            case "city":
                app.locations = null;
            case "location":
                app.dropCountries = null;
                app.dropCities = null;
            case "dropCity":
                app.dropLocations = null;
        }
    }

    var params = $route.current.params;

    if (params.country && ($filter('filter')(app.countries, {
            name: params.country
        }, true).length > 0)) {
        app.countries.selected = {
            id: params.country.split('+').join(' '),
            name: params.country.split('+').join(' ')
        }
        LocationService.getAjax({
                country: app.countries.selected.id
            })
            .then(function(data) {
                app.cities = data;
                var found = $filter('filter')(app.cities, {
                        name: params.city
                    }, true);
                if (params.city && found) {
                    app.cities.selected = found[0]
                    LocationService.getAjax({
                            country: app.countries.selected.id,
                            city: app.cities.selected.id
                        })
                        .then(function(data) {
                            app.locations = data;
                            var found = $filter('filter')(app.locations, {
                                    name: params.location
                                }, true);
                            if (params.location && found) {
                                app.locations.selected = found[0];
                                app.locationChanged();
                            } else {
                                if (data.length == 1) {
                                    app.locations.selected = data[0];
                                    app.locationChanged();
                                }
                            }
                        });
                } else {
                    if (data.length == 1) {
                        app.cities.selected = data[0];
                        app.cityChanged();
                    }
                }
            });
    }
})
