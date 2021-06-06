require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const { nanoid } = require('nanoid');
var dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;
const uri = process.env.DB_URI

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//URL Shortener
let urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
})
let urls = mongoose.model('urls', urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/shorturl', (req, res) => {
let enteredURL= req.body.url;
dns.lookup(enteredURL, err => {
  if(err) {
    res.json({ error: 'invalid url' })
  }else{
    let urlEnding = nanoid(10);

    let shortener = new urls({
      original_url: enteredURL,
      short_url: __dirname + "/api/shorturl/" + urlEnding
  })

  shortener.save((err, doc) => {
       if (err) return console.error(err);
       res.json({
         original_url: shortener.original_url,
         short_url: shortener.short_url
       })
     })

}
})
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
