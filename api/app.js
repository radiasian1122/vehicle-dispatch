const express = require("express");
const app = express();
const port = 8080;
const cors = require("cors");
const knex = require("knex")(require("./knexfile.js")["docker"]);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("App is up and running.");
});

app.get("/vehicles", (req, res) => {
    res.send("Welcome to vehicles!");
});

app.listen(port, () => {
  console.log("Your knex and express app running successfully!");
});
