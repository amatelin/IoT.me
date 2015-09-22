// Middleware used to check if user is authenticated before accessing a resource
function authenticate(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = "You need to be authenticated to access this resource.";
        res.redirect("/");
    }
}

exports.authenticate = authenticate;