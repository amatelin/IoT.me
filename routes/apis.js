var express = require("express"),
    router = express.Router(),
    mongoose = require("mongoose"),
    twitter = require("../apis/parent/twitter");
    services = require("../apis/index");

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

router.get("/twitter/findColorCode", function(req, res) {
    var twitter_handle = req.query.user;
    var hashtag = req.query.tag;

    services.twitter.findColorCode(twitter_handle, hashtag, function(tweets) {
        res.json(tweets);
    });
});


module.exports = router;