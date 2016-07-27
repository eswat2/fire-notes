let mongoose = require('mongoose');

let noteSchema = mongoose.Schema({
    user: String,
    values: [ String ]
});

let Note = mongoose.model('Note', noteSchema);
let db   = null;

let connectDB = (uri) => {
  mongoose.connect(uri);

  db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    // we're connected!
    console.log('-- mongoLab:  connected');
  });
};

let getKeys = (callback) => {
  Note.find({}, function(err, list) {
    if (!err) {
      let keys = list.map(function(item) { return item.user; }).sort();
      callback(null, keys);
    }
  });
}

let getNote = (user, callback) => {
  Note.findOne({ user: user }, callback);
};

let postNote = (user, value, callback) => {
  let note = null;

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
//
// NOTE:  the callback needs to be in this form - function(error, data)
//
//
let api = {
  connect: connectDB,
  keys: getKeys,
  get: getNote,
  post: postNote
}

module.exports = api;
