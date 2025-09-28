// models/list.js

const mongoose = require("mongoose");
<<<<<<< HEAD
=======
// This line now works because item.js is exporting itemSchema
>>>>>>> 712b1de4796528022d8440cdc44957d608912e8c
const { itemSchema } = require("./item");

const listSchema = new mongoose.Schema({
  name: String,
<<<<<<< HEAD
  items: [itemSchema],
=======
  items: [itemSchema], // Mongoose now receives the valid schema
>>>>>>> 712b1de4796528022d8440cdc44957d608912e8c
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model("List", listSchema);
