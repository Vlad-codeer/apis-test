const request = require('request');
const http = require('http');
const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const apikey = JSON.parse(fs.readFileSync('./config.json')).apikey;
const functions = require('./routes/exports.js');
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
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

server.listen(port, () => {
  console.log(`server running in \"http://localhost:${port}\"`);
});