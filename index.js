require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

let urls = [];
let id = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL Shortener API Endpoint
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  const regex = /^(http|https):\/\/[^ "]+$/;

  if (!regex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(new URL(originalUrl).hostname, (err) => {
    if (err) return res.json({ error: 'invalid url' });

    const shortUrl = id++;
    urls.push({ originalUrl, shortUrl });
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = parseInt(req.params.shortUrl);
  const urlEntry = urls.find(u => u.shortUrl === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});