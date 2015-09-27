var express = require("express"),
    router = express.Router(),
    hat = require("hat"),
    mongoose = require("mongoose"),
    Client = mongoose.model("Client"),
    hat = require("hat"),
    apis = require("../apis/index");


router.get("/new", function(req, res) {
    console.log(apis);
    res.render("clients/new", {apis_list:apis});
});

router.get("/:id/edit", function(req, res) {
    Client.findOne({_id: req.params.id}, function(err, client) {
        res.render("clients/edit", {client: client});
    });
});

/* CRUD API */
// Create - POST
router.post("/", function(req, res, next) {
    // Get values from POST request
    var name = req.body.name;
    var api = req.body.payloadApi;
    var apiMethod = req.body.payloadMethod;
    var apiOption = req.body.payloadOption;

    var payload = {};
    payload[api] = {};
    payload[api].method = apiMethod;
    payload[api].option = apiOption;

    // Create new user document
    Client.create({
        name: name, 
        api_key: hat(),
        owner_name: req.session.user.name,
        payload: payload
    }, function(err, user) {
        if (err) {
            console.log("Error creating new user: " + err);
            res.send("Error creating new user.");
        } else {
            console.log("POST creating new user: " + user);
            res.json(user);
        }
    })
});

// Retreive by ID - GET
router.get("/:id", function(req, res){
    // Find user document by id
    Client.findById(req.params.id, function(err, user){
        if (err) {
            console.log("Error retrieving user " + err);
            res.send("Error retrieving user.");
        } else {
            console.log("GET user with ID: " + user._id);
            res.json(user);
        }
    });
});

// Update by ID - PUT
router.put("/:id/edit", function(req, res) {
    // Get form values
    var newUsername = req.body.username;
    var newPassword = req.body.newPassword;
    var newPasswordBis = req.body.newPasswordConfirm;
    
    var passError = null;

    if (!passError) {
        //find user document by ID
        Client.findById(req.params.id, function(err, client) {
            if (err) {
                console.log("Error retrieving user " + err);
                req.session.error = "A problem occured retrieving the user.";
                res.redirect("/settings");
            } else {

                // Save is used instead of update so that the hashing middleware is called on the password
                client.save(user, function(err, userID) {
                    if (err) {
                        console.log("Error updating user: " + err);
                        req.session.error = "A problem occured updating the user.";
                        res.redirect("/settings");
                    } else {
                        console.log("UPDATE user with id: " + userID);
                        // Regenerate session with new user info
                        res.redirect("/index"); 
                    }                      
                });               
            }

        });        
    }
});

// Delete by ID - DELETE
router.delete("/:id", function(req, res) {
    // Find user document by id
    User.findById(req.params.id, function(err, user){
        if (err) {
            console.log("Error retrieving user " + err);
            req.session.error = "A problem occured retrieving the user.";
            res.redirect("/settings");
        } else {
            // Remove user document
            Client.remove(function(err, user){
                if (err) {
                    console.log("Error deleting the user " + err);
                    req.session.error = "A problem occured deleting the user.";
                    res.redirect("/settings");
                } else {
                    console.log("DELETE user with ID: " + user._id);
                    req.session.regenerate(function() {
                        req.session.success = "Account successfully deleted";
                        res.redirect("/setup");
                    })
                }
            });
        }
    });
});



module.exports = router;