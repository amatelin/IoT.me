var express = require("express"),
    router = express.Router(),
    hat = require("hat"),
    mongoose = require("mongoose"),
    Dataset = mongoose.model("Dataset"),
    helper = require("../utils");

// GET request to push data to the dataset
router.get("/update", function(req, res) {
    // Get values from request arguments
    var apiKey = req.query.key;
    delete req.query.key; // flush api key value so we only keep values concerning variables

    var values = [];
    var updateQuery = {};

    // Find dataset by write API key
    // Send status code for each case : -1 if error, 0 if no dataset found and 1 if update successful
    Dataset.findOne({write_key:apiKey}, function(err, dataset) {
        if (err) {
            console.log("Error retrieving dataset: " + err);
            res.sendStatus(-1);
        } else if (dataset.data) {
            // build $push query with variables passed in POST request
            // we check that the variable have already been registered otherwise they"ll be ignored
            for (var property in req.query) {
                if (req.query.hasOwnProperty(property)&dataset.data.hasOwnProperty(property)) {
                  updateQuery["data." + property + ".values"] = [parseInt(req.query[property]), Date.now()]; 
                }
            }
            // Update dataset with new values and increment entries_number
            dataset.update({$push: updateQuery,
                            $inc: {entries_number: 1}, 
                            last_entry_at: Date.now()}, function(err, datasetID) {
                if (err) {
                    console.log("Error updating dataset: " + err);
                    res.sendStatus(-1);
                } else {
                    console.log("New entry for dataset with API key: " + apiKey);
                    res.sendStatus(1);
                }
            });
        } else {
            console.log("Either no dataset was found for this API key: " + apiKey + " or the dataset doesn't have any variables set");
            res.sendStatus(0);
        }
    });
});

// GET request to get data
router.get("/request", function(req, res) {
    // Get values from request arguments
    var apiKey = req.query.key;

    // Find dataset by read API key
    Dataset.findOne({read_key: apiKey}, function(err, dataset) {
        if (err) {
            console.log("Error retrieving dataset: " + err);
            res.sendStatus(-1);
        } else if (dataset) {
            // Strip dataset from sensible informations (_id and API keys)
            var cleanDataset = {owner_name: dataset.owner_name,
                                name: dataset.name, 
                                index: dataset.index,
                                public: dataset.public,
                                created_at: dataset.created_at,
                                last_entry_at: dataset.last_entry_at,
                                entries_number: dataset.entries_number,
                                data: dataset.data
                                }
            // return dataset as json
            res.json(cleanDataset);
        } else {
            console.log("No dataset found for this API key: " + apiKey);
            res.sendStatus(0);
        }
    });
});

/* Views controllers */
// GET new dataset page
router.get("/new", helper.authenticate, function(req, res) {
    res.render("datasets/new");
});

// GET edit dataset page
router.get("/:index/edit", helper.authenticate, function(req, res) {
    var index = req.params.index;

    // Find dataset by index
    Dataset.findOne({index: index}, function(err, dataset) {
        res.render("datasets/edit", {"dataset": dataset});
    });
});

// Get show dataset page
router.get("/:index", function(req, res) {
    var index = req.params.index;

    // Find dataset by index
    Dataset.findOne({index: index}, function(err, dataset) {
        if (err) {
            req.session.error = "Error retrieving the dataset";
            res.redirect("/index");
        } else {
            // Only send non-sensible info to res (ie: striped from API keys)
            var cleanDataset = {name : dataset.name,
                                created_at: dataset.created_at, 
                                last_entry_at: dataset.last_entry_at,
                                entries_number: dataset.entries_number,
                                data: dataset.data}

            // Check if the dataset is public or not
            // If it is, no need for auth middleware. If not, check auth
            if (!dataset.public) {
                helper.authenticate(req, res, function() {
                    res.render("datasets/show", {dataset: cleanDataset})     
                });
            } else {
                res.render("datasets/show", {dataset: cleanDataset});
            }
        }
    });
});

/* CRUD API */
// POST new dataset request
router.post("/", helper.authenticate, function(req, res) {
    // Used to set the dataset owner
    var sessionUser = req.session.user.name;
    // Get values from the post request
    var name = req.body.name;
    var isPublic = req.body.public != undefined ? true:false;
    // Delete the values from the request body so that we only keep information about the variables
    delete req.body.name;
    delete req.body.public;

    // This is so that we can loop through the object in reverse order
    // We do that so that the fields are saved in the right order on the db
    // (this way it will appear in the right order on the 'edit' view)
    var propertiesList = [];
    for (var property in req.body) {
        if (req.body.hasOwnProperty(property)) {
            propertiesList.push(property);
        }
    }
    propertiesList.reverse();

    var variablesFields = {};
    for (var i in propertiesList) {
        console.log(propertiesList[i])
        variablesFields[propertiesList[i]] = {name:req.body[propertiesList[i]],
                                    values: Array}; 
    }

    // Create dataset 
    Dataset.create({
        index: helper.uniqueIndex(),
        name: name,
        owner_name: sessionUser,
        read_key: hat(), 
        write_key: hat(),
        public: isPublic,
        data: variablesFields
    }, function(err, dataset) {
        if (err) {
            console.log("Error creating the dataset: " + err);
            req.session.error = "A problem occured when creating the dataset. Please try again.";
        } else {
            console.log("New dataset created with id: " + dataset._id);
            req.session.success = "Dataset " + name + " created successfully.";
        }
        res.redirect("/index");
    });
});

// PUT request to update dataset
router.put("/:id/", helper.authenticate, function(req, res) {
    // Get values from the POST request
    var name = req.body.name;
    var isPublic = req.body.public != undefined ? true:false;
    // Delete the values from the request body so that we only keep information about the variables
    delete req.body.name
    delete req.body.public

    var setList = {};
    var unsetList = {};
    var updateQuery = {};

    // Find dataset by id
    Dataset.findById(req.params.id, function(err, dataset) {
        updateQuery = {
            name: name,
            public: isPublic
        }
        // If variable in request body and not in dataset, add to setList (or if no variable at all in dataset)
        for (var property in req.body) {
            if (!dataset.data||(req.body.hasOwnProperty(property)&!dataset.data.hasOwnProperty(property))) {
                console.log(property)
                console.log(req.body[property])
                setList["data."+ property] = {name:req.body[property],
                                                values: Array}; 
            }
        }

        // If variable in dataset but not in request body, add to unsetList
        for (var property in dataset.data) {
            if (dataset.data&&dataset.data.hasOwnProperty(property)&!req.body.hasOwnProperty(property))
            {
                unsetList["data."+property] = true;
            }
        }

        // If setList or unsetList non-empty, add to updateQuery
        if (Object.keys(setList).length) {
            updateQuery["$set"] = setList;
        }
        if (Object.keys(unsetList).length) {
            updateQuery["$unset"] = unsetList;
        }

        // Update dataset
        dataset.update(updateQuery, function(err, response) {
            if (err) {
                console.log("Error updating dataset: " + err);
                req.session.error = "Update failed, please try again.";
            } else {
                console.log("Update on dataset: " + dataset._id);
                req.session.success = "Update successul.";
            }
            res.redirect("/index");
        });
    });
});

// DELETE dataset request 
router.delete("/:id/", helper.authenticate, function(req, res) {
    // Find dataset by id
    Dataset.findById(req.params.id, function(err, dataset) {
        if (err) {
            console.log("Error retrieving the dataset: " + err);
            req.session.error = "A problem occured retrieving the dataset.";
            req.location("index");
            res.redirect("/index");
        } else {
            // Remove dataset document
            dataset.remove(function(err, dataset) {
                if (err) {
                    console.log("Error deleting dataset: " + err);
                    req.session.error("A problem occured deleting the dataset. Please try again.");
                } else {
                    console.log("Deleted dataset with id: " + dataset._id);
                    req.session.success = "Successfully deleted dataset " + dataset.name;
                }
                res.redirect("/index");
            });
        }
    });
});

// POST request to update API key
router.post("/update/key", helper.authenticate, function(req, res) {
    var redirectUrl = req.headers.referer; // used to redirect to dataset edit page
    // Get values from the POST request
    var id = req.body.id;
    var key = req.body.key;

    var updateJson = {};
    updateJson[key+"_key"] = hat(); // Generate new API key

    // Find dataset by ID 
    Dataset.findById(id, function(err, dataset) {
        if (err) {
            console.log("Error retrieving dataset: " + err);
            req.session.error = "A problem occured finding the dataset";
            res.redirect(redirectUrl);
        } else {
            // Update dataset with new key
            dataset.update(updateJson, function(err, datasetID) {
                console.log("API key updated: " + key);
                res.redirect(redirectUrl);
            });
        }
    });
});

module.exports = router;