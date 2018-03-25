var app = angular.module('VoltaPlanner', []);

app.controller('mainController', function($http, $scope) {
    $scope.planTrip = function() {
        var startLocation = document.getElementById('start_location');
        var endLocation = document.getElementById('end_location');
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'placeId': startLocation}, function(startCoord, status) {
            if (status !== 'OK') {
                alert('Geocode failed for the operation');
                return;
            }
            geocoder.geocode({'placeId': endLocation}, function(endCoord, status) {
                if(status === 'OK') {
                    $http.get('/route?startLocation=' + startCoord + '&endLocation=' + endCoord)
                        .success(function (res) {
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