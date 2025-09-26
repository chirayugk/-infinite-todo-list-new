// models/list.js

const mongoose = require("mongoose");
// This line now works because item.js is exporting itemSchema
const { itemSchema } = require("./item");

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema], // Mongoose now receives the valid schema
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model("List", listSchema);
