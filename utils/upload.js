const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '');
    cb(null, `${name}-${timestamp}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  // Allow only image files
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter
});

// Single file upload middleware
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Image upload middleware (restricted to images only)
const uploadImage = () => {
  return upload.single('image');
};

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large',
        maxSize: process.env.MAX_FILE_SIZE || '5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files',
        maxCount: error.limit
      });
    }
  }
  
  if (error.message === 'Invalid file type. Only image files are allowed.') {
    return res.status(400).json({
      message: error.message
    });
  }
  
  next(error);
};

module.exports = {
  uploadSingle,
  uploadImage,
  uploadMultiple,
  handleUploadError
};
