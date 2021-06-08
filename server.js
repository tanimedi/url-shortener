require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
const { nanoid } = require("nanoid");
var dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch((err) => console.log(err));

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

//URL Shortener
let addressSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
  urlEnding: String
});
let address = mongoose.model("address", addressSchema);

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/shorturl", (req, res) => {
  let enteredURL = req.body.url;
  dns.lookup(enteredURL, (err) => {
    if (err) {
      res.json({ error: "invalid url" });
    } else {
      let urlEnding = nanoid(10);

      let shortener = new address({
        original_url: enteredURL,
        short_url: __dirname + "/api/shorturl/" + urlEnding,
        urlEnding: urlEnding
      });

      shortener.save((err, doc) => {
        if (err) return console.error(err);
        res.json({
          original_url: shortener.original_url,
          short_url: shortener.short_url
        });
      });
    }
  });
});

app.get("/api/shorturl/:urlEnding", (req, res) => {
  let ending = req.params.urlEnding;
  address.find({ urlEnding: ending }, (err, docs) => {
    if (err) return console.error(err);
    res.redirect(docs[0].original_url);
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
