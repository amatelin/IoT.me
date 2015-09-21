var mongoose = require("mongoose");

// Declare schema
var datasetSchema = new mongoose.Schema({
    index: {type: String, required: true, index: {unique: true}},
    name: {type: String, required: true},
    owner_name: {type: String, required: true},
    read_key: {type: String},
    write_key: {type: String},
    public: {type: Boolean, default: false},
    data: {type: Object},
    entries_number: {type: Number, default: 0}, 
    created_at: {type: Date, default: Date.now},
    last_entry_at: {type: Date}
});

// Export schema
mongoose.model("Dataset", datasetSchema);