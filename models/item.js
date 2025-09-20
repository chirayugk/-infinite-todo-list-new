const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: String
});

module.exports = mongoose.model("Item", itemSchema);
