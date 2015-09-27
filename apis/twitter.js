var Twitter = require("twitter"),
    config = require("../config");

var client = new Twitter(config.twitter);

exports.search = function(text, next) {
    var params = {q: text};
    client.get('search/tweets', params, function(error, tweets, response){
       console.log(tweets);
       next(tweets);
    });
}

exports.geoSearch = function(text, next) {
    var params = {query: text};
    client.get('geo/search.json', params, function(error, tweets, response){
      if (!error) {
        console.log(tweets);
        next(tweets);
      }
    });
}


