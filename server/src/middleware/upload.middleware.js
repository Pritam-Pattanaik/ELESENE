const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists unconditionally
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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

// Memory Storage for Supabase uploads
const memoryStorage = multer.memoryStorage();

// Check if valid, non-placeholder Supabase credentials exist
const hasValidSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return false;
  if (url.includes('placeholder') || url.includes('your-project') || url.includes('example')) return false;
  if (key.includes('placeholder') || key.includes('your_') || key.includes('example')) return false;
  return true;
};

const useSupabase = hasValidSupabase();
const storage = useSupabase ? memoryStorage : diskStorage;

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
