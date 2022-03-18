const request = require('request');
const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const apikey = JSON.parse(fs.readFileSync('./config.json')).apikey;
const functions = require('./routes/exports.js');
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/pagina-inicial.html'));
});

app.get('/css/style.css', (req, res) => {
  res.sendFile(path.join(__dirname + '/css/style.css'));
});

app.get('/api', (req, res) => {
  res.status(200).send({
    status: true,
    message: 'server ok'
  });
});

app.get('/api/image-search', (req, res) => {
  functions.image(req, res, apikey);
});

app.get('/api/xvideos', (req, res) => {
  functions.xvideos(req, res, apikey);
});

app.get('/api/youtube-search', (req, res) => {
  functions.youtube(req, res, apikey);
});

app.get('/api/ytmp3', (req, res) => {
  functions.ytmp3(req, res, apikey);
});

app.get('/api/ig-download', (req, res) => {
  functions.download_instagram(req, res, apikey);
});

server.listen(port, () => {
  console.log(`server running in \"http://localhost:${port}\"`);
});
