var express = require('express');
const fetch = require('node-fetch');

const headers = {
    'Accept':'application/json'
};

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Volta Trip Planning' });
});

router.get('/route', function(req, res) {
    /**
     * @param startLocation [latitude, longitude] list of start location
     * @param endLocation [latitude, longitude] list of destination location
     * @param maxRange number designated
     */
    if (!req.query.range) {
        res.status(400);
    }
    var startLat = req.query.startLocation.split(",")[0];
    var startLon = req.query.startLocation.split(",")[1];
    var endLat = req.query.endLocation.split(",")[0];
    var endLon = req.query.endLocation.split(",")[1];
    var maxDist = req.query.range;
    var toplat = startLat > endLat ? startLat : endLat + maxDist / 69;
    var bottomlat = startLat <= endLat ? startLat : endLat - maxDist / 69;
    var toplon = startLon > endLon ? startLon : endLon + maxDist / 69;
    var bottomlon = startLon <= endLon ? startLon : endLon - maxDist / 69;
    fetch('https://api.voltaapi.com/v1/stations',
        {
            method: 'GET',
            headers: headers,
            bounding: JSON.stringify({
                'toplat': toplat,
                'toplon': toplon,
                'bottomlat': bottomlat,
                'bottomlon': bottomlon
            }),
            query: 'a'
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(body) {
            // run greedy best first search
            var haversine = function(lat1, lat2, lon1, lon2) {
                var R = 6371e3; // miles
                var phi_1 = lat1 * Math.PI / 180;
                var phi_2 = lat2 * Math.PI / 180;
                var delta_phi = (lat2-lat1) * Math.PI / 180;
                var delta_lambda = (lon2-lon1) * Math.PI / 180;

                var a = Math.sin(delta_phi/2) * Math.sin(delta_phi/2) +
                    Math.cos(phi_1) * Math.cos(phi_2) *
                    Math.sin(delta_lambda/2) * Math.sin(delta_lambda/2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                return R * c / 1000 / 1.609344;
            };
            var path = [];
            body.push({'name': 'destination', 'dist': -1, 'location': {'coordinates': [endLon, endLat]}});
            for (var i = 0; i < body.length; i++) {
                var bodyLon = body[i].location.coordinates[0];
                var bodyLat = body[i].location.coordinates[1];
                body[i].dist = haversine(bodyLat, endLat, bodyLon, endLon);
            }
            function greedy(start) {
                var minCoord, minHeur;
                for (i = 0; i < body.length; i++) {
                    var dist = haversine(start.location.coordinates[1], body[i].location.coordinates[1],
                        start.location.coordinates[0], body[i].location.coordinates[0]);
                    if (dist > maxDist) {
                        continue;
                    }
                    if (!minHeur || body[i].dist < minHeur) {
                        minHeur = body[i].dist;
                        minCoord = body[i];
                    }
                }
                return minCoord;
            }

            var begin = {'location': {
                    'coordinates': [startLon, startLat]
                }};
            do {
                var end = greedy(begin);
                begin = end;
                path.push(end);
            } while (end.dist > 0);
            res.json(JSON.stringify(path));
        });


});

module.exports = router;
