var express = require("express"),
    router = express.Router(),
    mongoose = require("mongoose"),
    User = mongoose.model("User"),
    helper = require("../utils");


/* CRUD API */
// Create - POST
router.post("/", helper.authenticate, function(req, res, next) {
    // Get values from POST request
    var name = req.body.name;
    var password = req.body.password;

    // Create new user document
    User.create({
        name: name, 
        password: password
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
router.get("/:id", helper.authenticate, function(req, res){
    // Find user document by id
    User.findById(req.params.id, function(err, user){
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
router.put("/:id/edit", helper.authenticate, function(req, res) {
    // Get form values
    var newUsername = req.body.username;
    var newPassword = req.body.newPassword;
    var newPasswordBis = req.body.newPasswordConfirm;
    
    var passError = null;

    // Check if password and confirmation match
    if(newPassword||newPasswordBis) {
        if (newPassword!=newPasswordBis) {
            newPassword = null;
            passError = true;
            req.session.error = "The passwords do not match, try again.";
            res.redirect("/settings");
        }
    }

    if (!passError) {
        //find user document by ID
        User.findById(req.params.id, function(err, user) {
            if (err) {
                console.log("Error retrieving user " + err);
                req.session.error = "A problem occured retrieving the user.";
                res.redirect("/settings");
            } else {
                 // Check what to update
                if (user.name!=newUsername) user.name = newUsername;
                if (newPassword) user.password = newPassword;

                // Save is used instead of update so that the hashing middleware is called on the password
                user.save(user, function(err, userID) {
                    if (err) {
                        console.log("Error updating user: " + err);
                        req.session.error = "A problem occured updating the user.";
                        res.redirect("/settings");
                    } else {
                        console.log("UPDATE user with id: " + userID);
                        // Regenerate session with new user info
                        req.session.regenerate(function() {
                            req.session.user = user;
                            req.session.success = "Update successful";
                            res.redirect("/index");                       
                        });

                    }
                });               
            }

        });        
    }
});

// Delete by ID - DELETE
router.delete("/:id", helper.authenticate, function(req, res) {
    // Find user document by id
    User.findById(req.params.id, function(err, user){
        if (err) {
            console.log("Error retrieving user " + err);
            req.session.error = "A problem occured retrieving the user.";
            res.redirect("/settings");
        } else {
            // Remove user document
            user.remove(function(err, user){
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
