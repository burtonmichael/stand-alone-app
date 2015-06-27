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

.controller('LocaleCtrl', function ($route, $filter, countries, LocationService, SessionService) {

	var app = this;

	app.countries = countries;

	var params = $route.current.params;

	app.preselectedCountry = params.country ? {
		id: params.country.split('+').join(' '),
		name: params.country.split('+').join(' ')
	} : null;

	app.preselectedCity = params.city ? {
		id: params.city.split('+').join(' '),
		name: params.city.split('+').join(' ')
	} : null;

	if (params.location) {
		var param = decodeURIComponent(params.location);
		var found = $filter('filter')(app.locations, {name: param}, true);
		if (found) {
			app.preselectedLocation = found;
			app.locationChanged(app.preselectedCountry, app.preselectedCity, app.preselectedLocation)
		} else {
			app.preselectedLocation = null;
		}
	} else {
		app.preselectedLocation = null;
	}

	app.countryChanged = function(selectedCountry) {
		app.clearFields("country");
		LocationService.getAjax({
			country: selectedCountry.id
		})
		.then(function(data) {
			app.cities = data;
			if(data.length == 1) {
				app.city.selected = data[0];
				app.cityChanged(selectedCountry, data[0]);
			}
		});
	};

	app.cityChanged = function(selectedCountry, selectedCity) {
		app.clearFields("city");
		LocationService.getAjax({
			country: selectedCountry.id,
			city: selectedCity.id
		})
		.then(function(data) {
			app.locations = data;
			if(data.length == 1) {
				app.location.selected = data[0];
				app.locationChanged(selectedCountry, selectedCity, data[0]);
			}
		});
	};

	app.locationChanged = function(selectedCountry, selectedCity, selectedLocation) {
		app.clearFields("location");
		app.dropCountries = [selectedCountry];
		app.dropCountry.selected = selectedCountry;
		LocationService.getAjax({
			country: selectedCountry.id
		})
		.then(function(data) {
			app.dropCities = data;
			if(data.length == 1) {
				app.dropCity.selected = data[0];
			} else {
				app.dropCity.selected = selectedCity;
			}
			app.dropCityChanged(selectedCountry, selectedCity);
			app.dropLocation.selected = selectedLocation;
		});
	};

	app.dropCityChanged = function(selectedCountry, selectedDropCity) {
		app.clearFields("dropCity");
		LocationService.getAjax({
			country: selectedCountry.id,
			city: selectedDropCity.id
		})
		.then(function(data) {
			app.dropLocations = data;
			if(data.length == 1) {
				app.dropLocation.selected = data[0];
			}
		});
	};

	app.clearFields = function(field){
		switch(field) {
			case "country":
				app.city = { selected: null };
				app.cities = null;
			case "city":
				app.location = { selected: null };
				app.locations = null;
			case "location":
				app.dropCountry = { selected: null };
				app.dropCountries = null;
				app.dropCity = { selected: null };
				app.dropCities = null;
			case "dropCity":
				app.dropLocation = { selected: null };
				app.dropLocations = null;
		}
	}
})