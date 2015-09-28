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

router.get("/payload", function(req, res) {
    var api_key = req.query.key;

    Client.findOne({api_key: api_key}, function(err, client) {
        var api_provider = Object.keys(client.payload)[0]
        var api_method = client.payload[api_provider].method
        var api_method_options = client.payload[api_provider].option.split(";")

        apis[api_provider][api_method](api_method_options[0], api_method_options[1], function(code) {
            res.json(code);
        })


    });
});

/* CRUD API */
// Create - POST
router.post("/", function(req, res, next) {
    // Get values from POST request
    console.log(req.body)
    var name = req.body.name;
    var api = req.body.payloadApi;
    var apiMethod = req.body.payloadMethod;
    var apiOption = req.body.payloadOption;

    var payload = {};
    payload[api] = {};
    payload[api].method = apiMethod;
    payload[api].option = apiOption;

    // Create new client document
    Client.create({
        name: name, 
        api_key: hat(),
        owner_name: req.session.user.name,
        payload: payload
    }, function(err, client) {
        if (err) {
            console.log("Error creating new client: " + err);
            res.send("Error creating new client.");
        } else {
            console.log("POST creating new client: " + client);
            res.redirect("index");
        }
    })
});

// Retreive by ID - GET
router.get("/:id", function(req, res){
    // Find client document by id
    Client.findById(req.params.id, function(err, client){
        if (err) {
            console.log("Error retrieving client " + err);
            res.send("Error retrieving client.");
        } else {
            console.log("GET client with ID: " + client._id);
            res.json(client);
        }
    });
});

// Update by ID - PUT
router.put("/:id/edit", function(req, res) {
    // Get form values
    var newclientname = req.body.clientname;
    var newPassword = req.body.newPassword;
    var newPasswordBis = req.body.newPasswordConfirm;
    
    var passError = null;

    if (!passError) {
        //find client document by ID
        Client.findById(req.params.id, function(err, client) {
            if (err) {
                console.log("Error retrieving client " + err);
                req.session.error = "A problem occured retrieving the client.";
                res.redirect("/settings");
            } else {

                // Save is used instead of update so that the hashing middleware is called on the password
                client.save(client, function(err, clientID) {
                    if (err) {
                        console.log("Error updating client: " + err);
                        req.session.error = "A problem occured updating the client.";
                        res.redirect("/settings");
                    } else {
                        console.log("UPDATE client with id: " + clientID);
                        // Regenerate session with new client info
                        res.redirect("/index"); 
                    }                      
                });               
            }

        });        
    }
});

// Delete by ID - DELETE
router.delete("/:id", function(req, res) {
    // Find client document by id
    Client.findById(req.params.id, function(err, client){
        if (err) {
            console.log("Error retrieving client " + err);
            req.session.error = "A problem occured retrieving the client.";
            res.redirect("/index");
        } else {
            // Remove client document
            client.remove(function(err, client){
                if (err) {
                    console.log("Error deleting the client " + err);
                    req.session.error = "A problem occured deleting the client.";
                    res.redirect("/index");
                } else {
                    console.log("DELETE client with ID: " + client._id);
                    res.redirect("/index");
                }
            });
        }
    });
});



module.exports = router;