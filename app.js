let wsServer = require("ws").Server
let express  = require('express');
let http     = require('http');
let fs       = require('fs');
let request  = require('request');
let notes    = require('./notes');

let bodyParser = require('body-parser');
let cors = require('cors');

let app  = express();
let port = process.env.PORT || 5000;

let mock = {
  wut:'a simple websocket & REST api notes server',
  why:'wanted to build something like firebase',
  who:'Richard Hess (aka. eswat2)',
  app:'https://egghead-notes.herokuapp.com',
  git:'https://github.com/eswat2/fire-notes',
  wss:'wss://fire-notes.herokuapp.com',
  api:[
    { url:'/keys',       verb:'GET',  what:'list of keys' },
    { url:'/notes',      verb:'POST', what:'creates/updates a note container' },
    { url:'/notes/:key', verb:'GET',  what:'fetch note container for this key' },
    { wss: {
      request: [ 'GET', 'KEYS', 'POST' ],
      response:[ 'DATA', 'ping' ]
    }}
  ]
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/keys', function (req, res, next) {
  notes.keys((err, keys) => {
    if (!err) {
      res.json(keys);
    }
  });
});

app.get('/notes/:username', function (req, res, next) {
  let user = req.params.username.toLowerCase();
  if (user) {
    notes.get(user, (err, object) => {
      if (!err) {
        if (object) {
          res.json(object);
        }
        else {
          res.json({ id:user, values:[] });
        }
      }
    });
  }
});

app.post('/notes', function (req, res, next) {
  let user  = req.body.id.toLowerCase();
  let value = req.body.values;
  notes.post(user, value, (err, object) => {
    if (!err) {
      // NOTE:  push the update to the websocket clients before responding...
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ type:'DATA', id:object.user, values:object.values }));
      });
      res.json(object);
    }
  });
});

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
      let obj  = JSON.parse(message);
      let user = obj.id.toLowerCase();
      console.log('-- wss: ' + obj.type + ' ' + user);
      if (obj.type == 'GET') {
        notes.get(user, (err, object) => {
          if (!err) {
            if (object) {
              ws.send(JSON.stringify({ type:'DATA', id:object.user, values:object.values }));
            }
            else {
              ws.send(JSON.stringify({ type:'DATA', id:user, values:[] }));
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
        notes.post(user, obj.value, (err, object) => {
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
