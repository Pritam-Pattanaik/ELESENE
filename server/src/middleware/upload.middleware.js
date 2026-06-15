const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists for local development
const uploadDir = path.join(__dirname, '../../uploads');
if (process.env.NODE_ENV !== 'production') {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

// Local Disk Storage
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Mock Cloud Storage (Memory) for Production Prep
// In a real scenario, this would use multer-google-storage or multer-s3
const memoryStorage = multer.memoryStorage();

const storage = process.env.NODE_ENV === 'production' ? memoryStorage : diskStorage;

const fileFilter = (req, file, cb) => {
  const filetypes = /jpg|jpeg|png|webp|avif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
