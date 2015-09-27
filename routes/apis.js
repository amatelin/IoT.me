var express = require("express"),
    router = express.Router(),
    mongoose = require("mongoose"),
    twitter = require("../apis/twitter");

router.get("/", function(req, res) {

});

router.get("/twitter/search", function(req, res) {
    var query = req.query.query;
    var geocode = req.query.geocode
    console.log(query);
    twitter.search(query, geocode, function(response) {
        res.json(response);
    });
});

router.get("/twitter/geoSearch", function(req, res) {
    var query = req.query.query
    twitter.geoSearch(query, function(response) {
        res.json(response);
    });
});

router.get("/twitter/timeline", function(req, res) {
    var query = req.query.query
    twitter.userTimeline(query, function(response) {
        res.json(response);
    });
});


module.exports = router;