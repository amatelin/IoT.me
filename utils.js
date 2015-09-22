// Middleware used to check if user is authenticated before accessing a resource
function authenticate(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = "You need to be authenticated to access this resource.";
        res.redirect("/");
    }
}

// Helper used to generate unique index of 9 characters based on the current timestamp + a little randomness
function uniqueIndex() {
    var now = new Date();
    var index = Math.floor(Math.random() * 10) + parseInt(now.getTime()).toString(36).toUpperCase();
    return index;
}

exports.authenticate = authenticate;
exports.uniqueIndex = uniqueIndex;