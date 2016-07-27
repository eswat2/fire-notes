var mongoose = require('mongoose');

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

function getKeys(callback) {
  Note.find({}, function(err, list) {
    if (!err) {
      var keys = list.map(function(item) { return item.user; }).sort();
      callback(null, keys);
    }
  });
}

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
//
// NOTE:  the callback needs to be in this form - function(error, data)
//
//
var api = {
  connect: connectDB,
  keys: getKeys,
  get: getNote,
  post: postNote
}

module.exports = api;
