const Book = require('../models/Book');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const fileFilter = (req, file, cb) => {
  // accepted ebook formats
  const filetypes = /epub|kepub|pdf|mobi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  // usual ebook MIME types
  const allowedMimes = [
    'application/epub+zip',
    'application/pdf',
    'application/x-mobipocket-ebook',
    'application/vnd.amazon.mobi8-export'
  ];

  if (extname || allowedMimes.includes(file.mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Format not supported. Please upload .epub, .pdf, or .mobi'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
}).single('ebook');

exports.uploadBook = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      const newBook = new Book({
        title: req.body.title || req.file.originalname,
        fileName: req.file.filename,
        format: path.extname(req.file.originalname).replace('.', '').toLowerCase(), // saves 'pdf', 'mobi', etc.
        owner: req.user.id, // get this from user middleware
        metadata: {
          description: req.body.description
        }
      });

      await newBook.save();
      res.status(201).json({ success: true, book: newBook });
    } catch (dbErr) {
      res.status(400).json({ error: dbErr.message });
    }
  });
};

exports.getBook = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user.id }).sort({ dateUploaded: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to get books" });
  }
};


exports.download = async (req, res) => {
  try {
    const { id } = req.params;
    const userAgent = req.get('user-agent') || '';
    const book = await Book.findById(id);
    console.log('book requested: ', book);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const uploadDir = '/app/uploads';
    const originalFilePath = path.join(uploadDir, book.fileName);

    const cleanFileName = book.fileName.includes('-') 
    ? book.fileName.split('-').slice(1).join('-') 
    : book.fileName;
    
    let fileToServe = originalFilePath;
    let fileNameToServe = cleanFileName;

    // todo: change || to &&
    if (userAgent.includes('Kobo') || book.fileName.toLowerCase().endsWith('.epub')) {

      const kepubFileName = book.fileName.replace(/\.epub$/i, '_converted.kepub.epub');
      const kepubFilePath = path.join(uploadDir, kepubFileName);
      const finalCleanedName = cleanFileName.replace(/\.epub$/i, '.kepub.epub');

      if (!fs.existsSync(kepubFilePath)) {
        console.log(`Converting ${book.fileName} -> ${kepubFileName}`);

        await new Promise((resolve, reject) => {
          const kepubify = spawn('kepubify', [originalFilePath], {
            cwd: uploadDir
          });

          kepubify.on('close', (code) => {
            if (code === 0) {
              console.log("Conversion successful");
              resolve();
            } else {
              console.error('kepubify failed: ', code);
              resolve(); // go back to original epub
            }
          });

          kepubify.on('error', (err) => {
            console.error("Spawn error:", err);
            resolve();
          });
        });
      }

      // update the path if converted file exists now
      if (fs.existsSync(kepubFilePath)) {
        console.log("updating filename to kepub file");
        fileToServe = kepubFilePath;
        fileNameToServe = finalCleanedName;
      }
    }

    // download
    res.download(fileToServe, fileNameToServe, (err) => {
      if (err) console.error("error during download:", err);
    });

  } catch (err) {
    console.error("book download func error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const uploadDir = '/app/uploads';
    const filePath = path.join(uploadDir, book.fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Book.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};