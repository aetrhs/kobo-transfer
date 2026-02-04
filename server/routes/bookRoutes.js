const express = require('express');
const router = express.Router();
const {uploadBook, getBook, download, deleteBook} = require('../controllers/bookController');
const auth = require('../middleware/authMiddleware'); 

router.post('/upload', auth, uploadBook);
router.get('/my-books', auth, getBook);
router.get('/download/:id', auth, download);
router.get('/delete/:id', auth, deleteBook);

module.exports = router;