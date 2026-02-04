const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, default: 'Unknown Author' },
  seriesName: { type: String, default: '' },
  fileName: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['uploaded', 'downloaded'], default: 'uploaded' },
  dateUploaded: { type: Date, default: Date.now },
  metadata: {
    description: String,
    pageCount: Number,
    publisher: String,
    language: String
  }
});

module.exports = mongoose.model('Book', bookSchema);