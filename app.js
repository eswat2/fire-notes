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

var data = { id:'eswat2', values:['unicorn','ui coder']};
var msg  = JSON.stringify(data);

wss.on('connection', (ws) => {
  console.log('-- wss: Client connected');

  ws.on('close', function() {
    console.log('-- wss: Client disconnected');
  });

  ws.on('message', function(message) {
    if (message == 'pong') {
      console.log('-- wss: pong');
    }
    else {
      var obj = JSON.parse(message);
      console.log('-- wss: ' + obj.type + ' ' + obj.id);
      if (obj.type == 'GET') {
        ws.send(message);
      }
    }
  });

  ws.send('ping');
});
