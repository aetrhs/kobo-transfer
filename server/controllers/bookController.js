const Book = require('../models/Book');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { title } = require('process');
// const epubMetadata = require('epub-metadata');
const EPub = require("epub2").EPub;

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
    cb(new Error('Invalid format. Please upload .epub, .pdf, or .mobi'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
}).single('ebook');

const getMainTitle = (str) => {
  // get title up until first . (remove file extensions) or first '('
  let core = str.includes('.') ? str.substring(0, str.lastIndexOf('.')) : str;
  core = core.replace(/\s*\[[^\]]*\]/g, '').replace(/\s*\([^)]*\)/g, '');
  return core.toLowerCase().replace(/[._\-]/g, ' ').replace(/\s+/g, ' ').trim();
};

// using epub2 to get metadata
// more reliable than epub-metadata
const getEpubMetadata = (path) => {
  return new Promise((resolve, reject) => {
    const epub = new EPub(path);
    epub.on("end", () => {
      resolve({
        title: epub.metadata.title,
        creator: epub.metadata.creator,
        publisher: epub.metadata.publisher,
        coverId : epub.metadata.cover,
        epub: epub
      });
    });
    epub.on("error", (err) => reject(err));
    epub.parse();
  });
};

const extractCover = (filePath, bookId) => {
  return new Promise((resolve) => {
    const epub = new EPub(filePath);
    epub.on('end', () => {
      const coverId = epub.metadata.cover;
      if (!coverId) return resolve(null);

      epub.getImage(coverId, (err, data, mimeType) => {
        if (err || !data) return resolve(null);

        const ext = mimeType.split('/')[1] || 'jpg';
        const coverFilename = `cover_${bookId}.${ext}`;
        
        const targetDir = '/app/uploads/covers'; 
        const finalPath = path.join(targetDir, coverFilename);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFile(finalPath, data, (writeErr) => {
          if (writeErr) return resolve(null);
          resolve(`/covers/${coverFilename}`);
        });
      });
    });
    epub.on('error', () => resolve(null));
    epub.parse();
  });
};

exports.uploadBook = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: err.message });
    const bookId = req.file.filename.split('-')[0];

    try {
      const filePath = req.file.path;
      let author = "Unknown Author";
      let title = req.body.title || req.file.originalname;
      let coverUrl = null;

      try {
        const metadata = await getEpubMetadata(filePath);
        if (metadata.creator) author = metadata.creator.text || metadata.creator;
        if (metadata.title) title = metadata.title;

        // get book cover
        coverUrl = await extractCover(filePath, bookId);
        console.log("metadata extracted:", metadata);
      } catch (metaErr) {
        console.log("Metadata extraction failed, falling back to filename:", metaErr.message);

        // get author from within brackets if cant extract metadata
        const authorMatch = originalName.match(/\(([^)]+)\)/);
        if (authorMatch) {
          author = authorMatch[1];
        }
      }

      const cleanedTitle = getMainTitle(title);
      const userBooks = await Book.find({ owner: req.user.id });

      const isDuplicate = userBooks.some(book => {
        const existingCleaned = getMainTitle(book.title);
        console.log(`cleanedTitle: "${cleanedTitle}\nexistingCleaned: "${existingCleaned}"`);
        return existingCleaned === cleanedTitle;
      });

      if (isDuplicate) {
        // delete the file if its a duplicate to save space
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        return res.status(400).json({
          error: "Duplicate Title",
          message: `A similar book called "${title}" has already been uploaded.`
        });
      }

      const newBook = new Book({
        title: title,
        author: author,
        fileName: req.file.filename,
        cover: coverUrl,
        format: path.extname(req.file.originalname).replace('.', '').toLowerCase(),
        owner: req.user.id,
        metadata: {
          description: req.body.description,
          publisher: req.body.publisher,
          language: req.body.language
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

    if (userAgent.includes('Kobo') && book.fileName.toLowerCase().endsWith('.epub')) {

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

    // mark status as downloaded
    book.isDownloaded = true;
    await book.save();

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
    console.log(`Book ${book.title} deleted successfully`);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//for testing
exports.getMainTitle = getMainTitle;