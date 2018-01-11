/* eslint no-console: "off" */
/* eslint    new-cap: "off" */
const mongoose = require('mongoose')

const noteSchema = mongoose.Schema({
  user: String,
  values: [ String ]
})

const Note = mongoose.model('Note', noteSchema)
let db   = null

const connectDB = (uri) => {
  mongoose.connect(uri, { useMongoClient: true })

  db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => {
    // we're connected!
    console.log('-- mongoLab:  connected')
  })
}

const getKeys = (callback) => {
  Note.find({}, (err, list) => {
    if (!err) {
      const keys = list.map((item) => { return item.user }).sort()
      callback(null, keys)
    }
  })
}

const getNote = (user, callback) => {
  const key = user.toLowerCase()

  Note.findOne({ user: key }, callback)
}

const postNote = (user, value, callback) => {
  let note = null
  const key = user.toLowerCase()

  getNote(key, (err, object) => {
    if (!err) {
      if (object) {
        note = object

        note.values.push(value)
      } else {
        note = new Note({ user: key, values: [ value ] })
      }
      note.save(callback)
    } else {
      callback('failed')
    }
  })
}
//
// NOTE:  the callback needs to be in this form - function(error, data)
//
//
const api = {
  connect: connectDB,
  keys: getKeys,
  get: getNote,
  post: postNote
}

module.exports = api
