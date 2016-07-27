var wsServer = require("ws").Server
var express  = require('express');
var http     = require('http');
var fs       = require('fs');
var request  = require('request');

var app  = express();
var port = process.env.PORT || 5000;

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

var server = http.createServer(app);
var serverOnPort = server.listen(port);

console.log("-- Notes Server listening on port " + port);

var wss = new wsServer({ server: serverOnPort });
console.log("-- websocket server created");

wss.on('connection', (ws) => {
  console.log('-- wss: Client connected');

  ws.on('close', function() { console.log('-- wss: Client disconnected'); });
  ws.on('message', function(message) { console.log('-- wss: ' + message); });

  ws.send('something');
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);
