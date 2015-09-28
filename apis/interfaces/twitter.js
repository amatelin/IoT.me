var twitter = require("../parent/twitter.js");

exports.findColorCode = function(user, hashtag, next) {
/*
Will look in the *user*'s timeline for the last tweet marked with the provided 
*hashtag* and returns the following color code.  
*/
    var colorCode = "";

    twitter.userTimeline(user, function(tweets) {
        for (i in tweets) {
            if (tweets[i]["entities"]["hashtags"][0].text&&tweets[i]["entities"]["hashtags"][0].text == hashtag) {
                console.log(tweets[i]["entities"]["hashtags"])
                colorCode = "#" + tweets[i]["entities"]["hashtags"][1].text;
                console.log(colorCode);
                break;
            }
        }
        next(colorCode);
    }); 
}
