// models/item.js

const mongoose = require('mongoose');

// 1. Define the schema
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

<<<<<<< HEAD
const Item = mongoose.model("Item", itemSchema);

module.exports = { Item, itemSchema };
=======
// 2. Create the model
const Item = mongoose.model('Item', itemSchema);

// 3. Export both the model and the schema
module.exports = { Item, itemSchema };
>>>>>>> 712b1de4796528022d8440cdc44957d608912e8c
