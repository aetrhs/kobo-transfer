require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const uploadDir = './uploads';
const path = require('path');

const app = express();

// middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/kobo_library';

// connect w kobo at 27017
mongoose.connect(MONGO_URI)
  .then(() => console.log('connected to mongo'))
  .catch((err) => console.error('error with connecting:', err));

app.use(express.static('public'));
app.use('/api/auth', authRoutes);
// app.use('/api/kobo', koboRoutes);
app.use('/api/books', bookRoutes);
app.use('/uploads', express.static('uploads'));

// make sure /uploads actually exist
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});