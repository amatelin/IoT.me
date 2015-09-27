var mongoose = require("mongoose");

// Declare schema
var clientSchema = new mongoose.Schema({
    name: {type: String, required: true},
    owner_name: {type: String, required: true},
    api_key: {type: String},
    payload: {type: Object}, 
    created_at: {type: Date, default: Date.now},
});

// Export schema
mongoose.model("Client", clientSchema);