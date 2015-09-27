var Twitter = require("twitter"),
    config = require("../config");

var client = new Twitter(config.twitter);

exports.search = function(text, geocode, next) {
    var params = {q: text, geocode: geocode, count:100};
    client.get('search/tweets', params, function(error, tweets, response){
       console.log(tweets);
       for (property in tweets["statuses"]) {
        console.log(tweets["statuses"][property].text)
       }
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

exports.userTimeline = function(text, next) {
    var params = {screen_name: text}; 
    client.get('statuses/user_timeline.json', params, function(error, tweets, response){
        if (!error) {
            // console.log(tweets);
            for (i in tweets) {
                console.log(tweets[i]["text"]);
                console.log(tweets[i]["entities"]["hashtags"]);
            }
            next(tweets);
        }
    });
}

exports.findColorCode = function(text, next) {
    var params = {screen_name: text}; 
    client.get('statuses/user_timeline.json', params, function(error, tweets, response){
        if (!error) {
            // console.log(tweets);
            for (i in tweets) {
                console.log(tweets[i]["text"]);
                console.log(tweets[i]["entities"]["hashtags"]);
            }
            next(tweets);
        }
    });
}


