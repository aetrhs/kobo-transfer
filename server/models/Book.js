const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, default: 'Unknown Author' },
  seriesName: { type: String, default: '' },
  cover: { type: String, default: '' },
  fileName: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDownloaded: { type: Boolean, default: false },
  dateUploaded: { type: Date, default: Date.now },
  metadata: {
    description: String,
    publisher: String,
    language: String
  }
});

module.exports = mongoose.model('Book', bookSchema);