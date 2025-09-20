const mongoose = require("mongoose");
const itemSchema = require("./item").schema;

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

module.exports = mongoose.model("List", listSchema);
