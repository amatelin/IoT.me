var express = require("express"),
    router = express.Router(),
    mongoose = require("mongoose"),
    twitter = require("../apis/twitter");

router.get("/", function(req, res) {

});

router.get("/twitter/search", function(req, res) {
    var query = req.query.query;
    console.log(query);
    twitter.search(query, function(response) {
        res.json(response);
    });
});

router.get("/twitter/geoSearch", function(req, res) {
    var query = req.query.query
    twitter.geoSearch(query, function(response) {
        res.json(response);
    });
});

module.exports = router;