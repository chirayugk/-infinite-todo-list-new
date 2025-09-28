// app.js
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');

// ----- MODELS -----
const User = require('./models/user');
const { Item } = require("./models/item");
const List = require("./models/list");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ----- PASSPORT & SESSION CONFIGURATION -----
app.use(session({
  secret: 'a-very-secret-key-that-is-long-and-random',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Use the User model for Passport configuration
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ----- DATABASE CONNECTION -----
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// ----- DEFAULT ITEMS -----
const defaultItems = [
  new Item({ name: "Welcome to your to-do list!" }),
  new Item({ name: "Hit + to add a new task." }),
  new Item({ name: "<-- Hit this to delete a task." })
];

// ----- AUTHENTICATION ROUTES -----

app.get('/register', (req, res) => res.render('register'));

app.post('/register', (req, res) => {
  User.register({ username: req.body.username }, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('register');
    }
    passport.authenticate('local')(req, res, () => {
      const today = new Date().toISOString().slice(0, 10);
      res.redirect('/' + today);
    });
  });
});

app.get('/login', (req, res) => res.render('login'));

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), (req, res) => {
  const selectedDate = req.body.date;
  if (selectedDate) {
    res.redirect('/' + selectedDate);
  } else {
    const today = new Date().toISOString().slice(0, 10);
    res.redirect('/' + today);
  }
});

app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

// ----- CORE APP ROUTES -----

app.get("/", ensureAuthenticated, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.redirect('/' + today);
});

app.post("/", ensureAuthenticated, async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  if (!itemName) { // Prevents adding empty items
    return res.redirect("/" + listName);
  }

  const newItem = new Item({ name: itemName });

  try {
    const foundList = await List.findOne({ name: listName, userId: req.user._id });
    if (foundList) {
      foundList.items.push(newItem);
      await foundList.save();
    }
    res.redirect("/" + listName);
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

app.post("/delete", ensureAuthenticated, async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  try {
    await List.findOneAndUpdate(
      { name: listName, userId: req.user._id },
      { $pull: { items: { _id: checkedItemId } } }
    );
    res.redirect("/" + listName);
  } catch (err) {
    console.error(err);
    res.redirect("/" + listName);
  }
});

app.get("/:customListName", ensureAuthenticated, async (req, res) => {
  const customListName = req.params.customListName;

  try {
    let foundList = await List.findOne({ name: customListName, userId: req.user._id });
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
        userId: req.user._id
      });
      await list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// ----- SERVER -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));