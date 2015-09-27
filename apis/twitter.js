var Twitter = require("twitter"),
    config = require("../config");

// var config = ;


exports.search = function(text, next) {
var client = new Twitter(config.twitter);
  /*  client.get("search/tweets.json", {q: '@lethitbeat'}, function(error, tweets, response) {
        console.log(tweets);
        console.log(error);
        // console.log(response);
        next();
    });*/

client.get('search/tweets', {q: 'node.js'}, function(error, tweets, response){
   console.log(tweets);
});
}

exports.test = function(next) {
// var Twitter = require('twitter');

var client = new Twitter(config.twitter);

var params = {query: 'Toronto'};
client.get('geo/search.json', params, function(error, tweets, response){
  if (!error) {
    console.log(tweets);
    next();
  }
});
}


