const mongoose = require("mongoose");
const { itemSchema } = require("./item"); // Assuming item schema is exported from item.js

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
  userId: { // Add this field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model("List", listSchema);