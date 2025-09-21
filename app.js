const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const Item = require("./models/item");
const List = require("./models/list");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

// Default items
const defaultItems = [
    new Item({ name: "Welcome to your to-do list!" }),
    new Item({ name: "Hit + to add a new task" }),
    new Item({ name: "← Hit this to delete a task" })
];

// Default list route
app.get("/", async (req, res) => {
    let items = await Item.find({});
    if (items.length === 0) {
        await Item.insertMany(defaultItems);
        items = defaultItems;
    }
    res.render("list", { listTitle: "Today", newListItems: items });
});

// Custom list route
app.get("/:customListName", async (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    let list = await List.findOne({ name: customListName });
    if (!list) {
        list = new List({ name: customListName, items: defaultItems });
        await list.save();
    }
    res.render("list", { listTitle: list.name, newListItems: list.items });
});

// Add new task
app.post("/", async (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({ name: itemName });

    if (listName === "Today") {
        await newItem.save();
        res.redirect("/");
    } else {
        const list = await List.findOne({ name: listName });
        list.items.push(newItem);
        await list.save();
        res.redirect("/" + listName);
    }
});

// Delete task
app.post("/delete", async (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        await Item.findByIdAndDelete(checkedItemId);
        res.redirect("/");
    } else {
        await List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: checkedItemId } } }
        );
        res.redirect("/" + listName);
    }
});

app.listen(3000, () => console.log("Server started on port 3000"));
