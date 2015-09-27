var express = require("express"),
    router = express.Router(),
    mongoose = require("mongoose"),
    twitter = require("../apis/twitter");

router.get("/", function(req, res) {

});

router.get("/twitter/search", function(req, res) {
    var query = req.query.q;
    console.log(query);
    twitter.search(query, function() {
        res.send("ok");
    });

    // query =
});

router.get("/twitter/test", function(req, res) {
    twitter.test(function() {
        res.send("ok");
    });

    // query =
});

module.exports = router;