# fire-notes
[![Dependency Status](https://dependencyci.com/github/eswat2/fire-notes/badge)](https://dependencyci.com/github/eswat2/fire-notes)
[![Heroku](https://heroku-badge.herokuapp.com/?app=faux-base&style=flat&svg=1)](https://fire-notes.herokuapp.com)

a simple [**WebSockets**](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) notes server to support the Github Note Taker app from the egghead.io course...

```
npm install -g foreman
npm install -g nodemon

npm install
sh demon
```

### Features:

- simple notes api built on [**mongoose**](http://mongoosejs.com/)
- api uses [**ws**](https://github.com/websockets/ws)
- notes are persisted to [**mlab**](https://mlab.com/)
- default response is JSON describing the server api


### Deployed:

the server has been deployed and is running here:  [faux-base](https://faux-base.herokuapp.com/)

```json
{
  "wut": "a simple websocket notes server",
  "why": "wanted to build something like firebase",
  "who": "Richard Hess (aka. eswat2)",
  "app": "https://egghead-notes.herokuapp.com",
  "git": "https://github.com/eswat2/fire-notes",
  "wss": "wss://fire-notes.herokuapp.com",
  "api": [
    {
      "type": "GET",
      "what": "fetch the note container for this key"
    },
    {
      "type": "KEYS",
      "what": "list of keys"
    },
    {
      "type": "POST",
      "what": "add a new note for this key"
    }
  ]
}
```

### Reference:

- [foreman](https://www.npmjs.com/package/foreman)
- [nodemon](https://www.npmjs.com/package/nodemon)
