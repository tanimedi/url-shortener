require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
const { nanoid } = require("nanoid");
var url = require("url");


// Basic Configuration
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI, {
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

//URL Shortener/

let addressSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});
let address = mongoose.model("address", addressSchema);

app.use(bodyParser.urlencoded({ extended: false }));

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

app.post("/api/shorturl", (req, res) => {
  let enteredURL = req.body.url;

  if (isValidHttpUrl(enteredURL) == false) {
    res.json({ error: "invalid url" });
  } else {
    let urlEnding = nanoid(10);

    let shortener = new address({
      original_url: enteredURL,
      short_url: urlEnding
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

app.get("/api/shorturl/:shorturl", (req, res) => {
  let shorturl = req.params.shorturl;
  address.findOne({ short_url: shorturl }, (err, result) => {
    if (err) {
      console.log(err);
    } else if (/^http/.test(result.original_url) == false) {
      res.redirect("https://" + result.original_url);
    } else {
      res.redirect(result.original_url);
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
