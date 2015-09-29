var twitter = require("../parent/twitter.js");

exports.findColorCode = function(user, hashtag, next) {
/*
Will look in the *user*'s timeline for the last tweet marked with the provided 
*hashtag* and returns the following color code.  
*/
    var colorCode;
    var hexColorCode;

    twitter.userTimeline(user, function(tweets) {
        for (i in tweets) {
            if (tweets[i]["entities"]["hashtags"][0].text&&tweets[i]["entities"]["hashtags"][0].text == hashtag) {
                colorCode = "#" + tweets[i]["entities"]["hashtags"][1].text;
                hexColorCode = hexToRgb(colorCode)
                console.log(colorCode);
                console.log(hexColorCode);
                break;
            }
        }
        next(hexColorCode);
    }); 
}

function hexToRgb(hex) {
/*
Source : stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
*/
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
