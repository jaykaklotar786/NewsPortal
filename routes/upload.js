const express = require('express');
const { uploadSingle, uploadImage, uploadMultiple, handleUploadError } = require('../utils/upload');
const { authenticateToken } = require('../utils/auth');

const router = express.Router();

// Single file upload
router.post('/single', authenticateToken, (req, res) => {
  uploadSingle('file')(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res);
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`
      }
    });
  });
});

// Multiple files upload
router.post('/multiple', authenticateToken, (req, res) => {
  uploadMultiple('files', 5)(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res);
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      url: `/uploads/${file.filename}`
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      count: uploadedFiles.length
    });
  });
});

// Image upload (specific for images only)
router.post('/image', authenticateToken, (req, res) => {
  uploadImage()(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res);
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    res.json({
      message: 'Image uploaded successfully',
      image: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`
      }
    });
  });
});

module.exports = router;
