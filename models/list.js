const mongoose = require("mongoose");
const { itemSchema } = require("./item");

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model("List", listSchema);