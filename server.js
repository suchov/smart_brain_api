const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "art",
    password: "",
    database: "smart-brain"
  }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
  users: [
    {
      id: "123",
      name: "John",
      email: "john@gmail.com",
      password: "cookies",
      entries: 0,
      joined: new Date()
    },
    {
      id: "124",
      name: "Sally",
      email: "sally@gmail.com",
      password: "bananas",
      entries: 0,
      joined: new Date()
    }
  ]
};

knex
  .select("*")
  .from("users")
  .then(data => {
    console.log(data);
  });

app.get("/", (req, res) => {
  res.send(database.users);
});

app.post("/signin", (req, res) => {
  if (
    req.body.email === database.users[0].email &&
    req.body.password === database.users[0].password
  ) {
    res.json(database.users[0]);
  } else {
    res.status(400).json("error logging in");
  }
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  bcrypt.compare(
    "secret",
    "$2a$10$.Bldj9B8illgKyUqZcgjYefErKj5Y0u1MiWSiwE1MKD0L6MA7CY2u",
    function(err, res) {
      console.log("first guess", res);
    }
  );
  bcrypt.compare(
    "notasecret",
    "$2a$10$.Bldj9B8illgKyUqZcgjYefErKj5Y0u1MiWSiwE1MKD0L6MA7CY2u",
    function(err, res) {
      console.log("second guess", res);
    }
  );
  knex("users")
    .returning("*")
    .insert({
      email: email,
      name: name,
      joined: new Date()
    })
    .then(user => {
      res.json(user[0]);
    })
    .catch(err => res.status(400).json("unable to register"));
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  knex
    .select("*")
    .from("users")
    .where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("not found");
      }
    })
    .catch(err => res.status(400).json("error getting user"));
});

app.put("/image", (req, res) => {
  const { id } = req.body;
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(400).json("not found");
  }
});

app.listen(4000, () => {
  console.log("app is running on port 4000");
});

// / --> res = this is working
// /signin --> POST success/fail
// /register --> POST user
// /profile/:userId --> GET = user
// /image --> PUT --> user "count of the images checked"
