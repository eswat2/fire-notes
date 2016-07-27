var wsServer = require("ws").Server
var express  = require('express');
var http     = require('http');
var fs       = require('fs');
var request  = require('request');
var mongoose = require('mongoose');

var app  = express();
var port = process.env.PORT || 5000;
var db   = null;

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

var server = http.createServer(app);
var serverOnPort = server.listen(port);

console.log("-- Notes Server listening on port " + port);

var noteSchema = mongoose.Schema({
    user: String,
    values: [ String ]
});

var Note = mongoose.model('Note', noteSchema);

function connectDB(MONGOLAB_URI) {
  mongoose.connect(MONGOLAB_URI);

  db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    // we're connected!
    console.log('-- mongoLab:  connected');
  });
};

function getNote(user, callback) {
  Note.findOne({ user: user }, callback);
};

function postNote(user, value, callback) {
  var note = null;

  getNote(user, function(err, object) {
    if (!err) {
      if (object) {
        note = object;

        note.values.push(value);
      }
      else {
        note = new Note({ user: user, values: [ value ] });
      }
      note.save(callback);
    }
    else {
      callback('failed');
    }
  });
};

connectDB(process.env.MONGODB_URI);

var wss = new wsServer({ server: serverOnPort });
console.log("-- websocket server created");

var data = { id:'eswat2', type:'NOTES', values:['unicorn','ui coder']};
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
        getNote(obj.id, function(err, object) {
          if (!err) {
            ws.send(JSON.stringify({ type:'DATA', id:object.id, values:object.values }));
          }
        });
      }
      if (obj.type == 'KEYS') {
        Note.find({}, function(err, list) {
          if (!err) {
            var keys = list.map(function(item) { return item.user; }).sort();
            ws.send(JSON.stringify({ type:'KEYS', keys:keys));
          }
        });
      }
      if (obj.type == 'POST') {
        postNote(obj.id, obj.value, function(err, object) {
          if (!err) {
            wss.clients.forEach((client) => {
              client.send({ type:'DATA', id:object.id, values:object.values });
            });
          }
        });
      }
    }
  });
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send('ping');
  });
}, 1000);
