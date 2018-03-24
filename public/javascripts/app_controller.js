var app = angular.module('VoltaPlanner', []);

app.controller('mainController', function($http, $scope) {

});

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.7749, lng: -122.4194},
        zoom: 10
    });

    var timeout;
    var startInput = document.getElementById('start_location');
    var startAutocomplete = new google.maps.places.Autocomplete(startInput, {placeIdOnly: true});
    var endInput = document.getElementById('end_location');
    var endAutocomplete = new google.maps.places.Autocomplete(endInput, {placeIdOnly: true});
}