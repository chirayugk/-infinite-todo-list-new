// app.js

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const _ = require("lodash");

// ----- MODELS -----
const User = require('./models/user');
const Item = require("./models/item"); // Use .model if you exported the model
const List = require("./models/list");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ----- PASSPORT & SESSION CONFIGURATION -----
app.use(session({
  secret: 'a-much-better-secret-key-than-this', // Change this to a random string
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ----- DATABASE CONNECTION -----
const mongoURL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/todolistDB";
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
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
  new Item({ name: "Hit + to add a new task" }),
  new Item({ name: "← Hit this to delete a task" })
];

// ----- AUTHENTICATION ROUTES -----

// Show the register form
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle user registration
app.post('/register', (req, res) => {
  User.register({ username: req.body.username }, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('register');
    }
    passport.authenticate('local')(req, res, () => {
      const today = new Date().toISOString().slice(0, 10);
      res.redirect('/' + today); // Redirect to today's list after registration
    });
  });
});

// Show the login form
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle user login
app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), (req, res) => {
  // Redirect to the date selected in the form
  const selectedDate = req.body.date;
  res.redirect('/' + selectedDate);
});

// Handle user logout
app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});


// ----- CORE APP ROUTES -----

// Root route redirects authenticated users to today's list
app.get("/", ensureAuthenticated, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.redirect('/' + today);
});

// Add new task (for any list)
app.post("/", ensureAuthenticated, async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({ name: itemName });
  
  try {
    const list = await List.findOne({ name: listName, userId: req.user._id });
    if (list) {
      list.items.push(newItem);
      await list.save();
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Delete task (from any list)
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

// Dynamic route for custom lists and dates
app.get("/:listName", ensureAuthenticated, async (req, res) => {
  const listName = _.capitalize(req.params.listName);
  
  try {
    let list = await List.findOne({ name: listName, userId: req.user._id });
    if (!list) {
      // If no list is found, create a new one for this user
      list = new List({
        name: listName,
        items: defaultItems,
        userId: req.user._id // Associate the new list with the logged-in user
      });
      await list.save();
    }
    res.render("list", { listTitle: list.name, newListItems: list.items });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// ----- SERVER -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
