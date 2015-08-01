angular.module('searchApp.controllers', ['ngRoute'])

.controller('HeadCtrl', ['$scope', 'SessionService', 'StyleService', function($scope, SessionService, StyleService) {
    if (SessionService.css) {
        var baseUrl = 'import/css/';
        var exports = [];

        var stylesheets = SessionService.css.replace('_', '/').split(',');

        angular.forEach(stylesheets, function(stylesheet) {
            this.push(baseUrl + stylesheet + '.css');
        }, exports);

        $scope.stylesheets = exports;
    }

    StyleService.setColor(SessionService.styles);
}])

.controller('MainCtrl', ['$scope', '$window', '$modal', '$filter', 'LocationService', 'SessionService', 'translations', function($scope, $window, $modal, $filter, LocationService, SessionService, translations) {

    $scope.translations = translations;
    $scope.countries = translations.countries;

    $scope.loading = {};

    $scope.form = {
        emptySearchResults: true,
        fromLocChoose: true
    };

    $scope.isRTL = SessionService.isRTL;

    $scope.frame = "pickup";

    $scope.i18n = {
        previousMonth: translations.previousMonth,
        nextMonth: translations.nextMonth,
        months: translations.moment.months,
        monthsShort: translations.moment.monthsShort,
        weekdays: translations.moment.weekdays,
        weekdaysShort: translations.moment.weekdaysShort
    };

    $scope.startDate = new Date();
    $scope.endDate = new Date();
    $scope.endDate.setDate($scope.startDate.getDate() + 3);

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
    };

    $scope.dateOpened = function(pikaday) {
        pikaday.focus = true;
        if (pikaday.el.offsetTop < 0) {
            pikaday.el.style.top = 0;
        }
    };

    $scope.dateClosed = function(pikaday) {
        pikaday.focus = false;
    };

    $scope.submit = function() {
        $scope.errors = {};
        $scope.messages = [];

        var form = $scope.form;

        var pickupError = false;
        var dropoffError = false;

        if (!form.country) $scope.errors.country = pickupError = true;
        if (!form.city) $scope.errors.city = pickupError = true;
        if (!form.location) $scope.errors.location = pickupError = true;

        if (pickupError) $scope.messages.push($scope.translations.errorLocation + $scope.translations.errorManditory);

        if (!form.dropCountry) $scope.errors.dropCountry = dropoffError = true;
        if (!form.dropCity) $scope.errors.dropCity = dropoffError = true;
        if (!form.dropLocation) $scope.errors.dropLocation = dropoffError = true;

        if (dropoffError) $scope.messages.push($scope.translations.errorDropLocation + $scope.translations.errorManditory);

        var pickupDateTime = $scope.pikaday.pickup.getMoment().hour(form.puHour).minute(form.puMinute);

        var dropoffDateTime = $scope.pikaday.dropoff.getMoment().hour(form.doHour).minute(form.doMinute);

        if (dropoffDateTime.diff(pickupDateTime, 'minutes') < 60) {
            $scope.errors.date = true;
            $scope.messages.push($scope.translations.errorDateLength);
        } else {
            form.puDay = pickupDateTime.date();
            form.puMonth = pickupDateTime.month() + 1;
            form.puYear = pickupDateTime.year();

            form.doDay = dropoffDateTime.date();
            form.doMonth = dropoffDateTime.month() + 1;
            form.doYear = dropoffDateTime.year();
        }

        if (!form.driversAge) {
            $scope.errors.driversAge = true;
            $scope.messages.push($scope.translations.errorDriversAge + $scope.translations.errorManditory);
        }

        if ($scope.messages.length > 0) {
            var modal = $modal.open({
                animation: false,
                templateUrl: 'partials/modal/modal.html',
                windowTemplateUrl: 'partials/modal/window.html',
                controller: 'ModalCtrl',
                backdrop: true,
                size: 'sm',
                resolve: {
                    translations: function() {
                        return $scope.translations;
                    },
                    messages: function() {
                        return $scope.messages;
                    }
                }
            });
        } else {
            $scope.submitSuccess();
        }
    };

    $scope.submitSuccess = function() {

        var base = SessionService.affUrl ? 'http://' + SessionService.affUrl : "http://www.rentalcars.com";

        var page = "/LoadingSearchResults.do";

        if (SessionService.jsessionid !== undefined) page += ";jsessionid=" + SessionService.jessionid;

        var locationNames = '';

        formData = Object.keys($scope.form).map(function(k) {
            if (typeof $scope.form[k] === 'object') {
                if (k === 'location') locationNames +=  '&locationName=' + encodeURIComponent($scope.form[k].name);
                if (k === 'dropLocation') locationNames +=  '&dropLocationName=' + encodeURIComponent($scope.form[k].name);
                return encodeURIComponent(k) + '=' + encodeURIComponent($scope.form[k].id);
            } else {
                return encodeURIComponent(k) + '=' + encodeURIComponent($scope.form[k]);
            }
        }).join('&');

        $window.open(base + page + '?' + formData + locationNames + SessionService.addAjaxReq);
    };

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
            case "dropCountry":
                $scope.dropCountryChanged();
                break;
            case "dropCity":
                $scope.dropCityChanged();
                break;
        }
    };

    $scope.clearFields = function(field) {
        switch (field) {
            case "country":
                $scope.form.city = null;
                $scope.cities = null;
                /* falls through */
            case "city":
                $scope.form.location = null;
                $scope.locations = null;
                /* falls through */
            case "location":
                /* falls through */
            case "dropCountry":
                $scope.form.dropCity = null;
                $scope.dropCities = null;
                /* falls through */
            case "dropCity":
                $scope.form.dropLocation = null;
                $scope.dropLocations = null;
                /* falls through */
            default:
                break;
        }
    };

    $scope.countryChanged = function() {
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

    $scope.cityChanged = function() {
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
            $scope.dropCountries = angular.copy($scope.countries);
            $scope.form.dropCountry = $scope.form.country;
            $scope.dropCities = angular.copy($scope.cities);
            $scope.form.dropCity = angular.copy($scope.form.city);
            $scope.dropLocations = angular.copy($scope.locations);
            $scope.form.dropLocation = angular.copy($scope.form.location);
        }
    };

    $scope.dropCountryChanged = function() {
        if ($scope.dropCountries) {
            $scope.loading.dropCities = true;
            LocationService.getAjax({
                    country: $scope.form.dropCountry.id
                })
                .then(function(data) {
                    $scope.loading.dropCities = null;
                    $scope.dropCities = data;
                    if (data.length == 1) {
                        $scope.form.dropCity = data[0];
                        $scope.dropCityChanged();
                    }
                });
        }
    };

    $scope.dropCityChanged = function() {
        if ($scope.dropCities) {
            $scope.loading.dropLocations = true;
            LocationService.getAjax({
                    country: $scope.form.dropCountry.id,
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

    if (SessionService.country && ($filter('filter')($scope.countries, {
            name: SessionService.country
        }, true).length > 0)) {
        $scope.form.country = {
            id: SessionService.country.split('+').join(' '),
            name: SessionService.country.split('+').join(' ')
        };
        LocationService.getAjax({
                country: $scope.form.country.id
            })
            .then(function(data) {
                $scope.cities = data;
                var found = $filter('filter')($scope.cities, {
                    name: SessionService.city
                }, true);
                if (SessionService.city && found) {
                    $scope.form.city = found[0];
                    LocationService.getAjax({
                            country: $scope.form.country.id,
                            city: $scope.form.city.id
                        })
                        .then(function(data) {
                            $scope.locations = data;
                            var found = $filter('filter')($scope.locations, {
                                name: SessionService.location
                            }, true);
                            if (SessionService.location && found) {
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

}])

.controller('ModalCtrl', ['$scope', '$modalInstance', 'translations', 'messages', function($scope, $modalInstance, translations, messages) {

    $scope.translations = translations;

    $scope.messages = messages;

    $scope.close = function() {
        $modalInstance.close();
    };
}]);
