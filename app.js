let wsServer = require("ws").Server
let express  = require('express');
let http     = require('http');
let fs       = require('fs');
let request  = require('request');
let notes    = require('./notes');

let app  = express();
let port = process.env.PORT || 5000;

let mock = {
  wut:'a simple websocket notes server',
  why:'wanted to build something like firebase',
  who:'Richard Hess (aka. eswat2)',
  app:'https://egghead-notes.herokuapp.com',
  git:'https://github.com/eswat2/fire-notes',
  wss:'wss://fire-notes.herokuapp.com',
  api:[
    { type:'GET',  what:'fetch the note container for this key' },
    { type:'KEYS', what:'list of keys' },
    { type:'POST', what:'add a new note for this key' }
  ]
};

app.use((req, res) => {
  res.send(mock);
});

let server = http.createServer(app);
let serverOnPort = server.listen(port);

console.log("-- Notes Server listening on port " + port);

notes.connect(process.env.MONGODB_URI);

let wss = new wsServer({ server: serverOnPort });
console.log("-- websocket server created");

wss.on('connection', (ws) => {
  console.log('-- wss: Client connected');

  ws.on('close', () => {
    console.log('-- wss: Client disconnected');
  });

  ws.on('message', (message) => {
    if (message == 'pong') {
      console.log('-- wss: pong');
    }
    else {
      let obj = JSON.parse(message);
      console.log('-- wss: ' + obj.type + ' ' + obj.id);
      if (obj.type == 'GET') {
        notes.get(obj.id, (err, object) => {
          if (!err) {
            if (object) {
              ws.send(JSON.stringify({ type:'DATA', id:object.user, values:object.values }));
            }
            else {
              ws.send(JSON.stringify({ type:'DATA', id:obj.id, values:[] }));
            }
          }
        });
      }
      if (obj.type == 'KEYS') {
        notes.keys((err, keys) => {
          if (!err) {
            ws.send(JSON.stringify({ type:'KEYS', keys:keys }));
          }
        });
      }
      if (obj.type == 'POST') {
        notes.post(obj.id, obj.value, (err, object) => {
          if (!err) {
            wss.clients.forEach((client) => {
              client.send(JSON.stringify({ type:'DATA', id:object.user, values:object.values }));
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
