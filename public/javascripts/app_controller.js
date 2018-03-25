var app = angular.module('VoltaPlanner', []);

app.controller('mainController', function($http, $scope) {
    $scope.planTrip = function() {
        var startLocation = document.getElementById('start_location').value;
        var endLocation = document.getElementById('end_location').value;
        var maxRange = document.getElementById('max_mileage').value;
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': startLocation}, function(startRaw, status) {
            if (status !== 'OK') {
                alert('Geocode failed for the operation');
                return;
            }
            var startCoord = [startRaw[0].geometry.location.lat(), startRaw[0].geometry.location.lng()];
            geocoder.geocode({'address': endLocation}, function(endRaw, status) {
                if(status === 'OK') {
                    var endCoord = [endRaw[0].geometry.location.lat(), endRaw[0].geometry.location.lng()];
                    $http.get('/route?startLocation=' + startCoord + '&endLocation=' + endCoord + '&range=' + maxRange)
                        .then(function (res) {
                            var map = new google.maps.Map(document.getElementById('map'), {
                                zoom: 3,
                                center: {lat: 0, lng: -180},
                                mapTypeId: 'terrain'
                            });

                            var flightPlanCoordinates = res.coordList;
                            var flightPath = new google.maps.Polyline({
                                path: flightPlanCoordinates,
                                geodesic: true,
                                strokeColor: '#FF0000',
                                strokeOpacity: 1.0,
                                strokeWeight: 2
                            });

                            flightPath.setMap(map);
                        })
                        .failure(function (err) {
                            alert(err);
                        })
                } else {
                    alert('Geocode failed for the operation');
                }
            });
        });
    }
});
function initMap() {
    new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.7749, lng: -122.4194},
        zoom: 10
    });

    var startInput = document.getElementById('start_location');
    new google.maps.places.Autocomplete(startInput, {placeIdOnly: true});
    var endInput = document.getElementById('end_location');
    new google.maps.places.Autocomplete(endInput, {placeIdOnly: true});
}