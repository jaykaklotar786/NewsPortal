const express = require('express');
const News = require('../models/News');
const User = require('../models/User');
const { authenticateToken, authorizeAdmin } = require('../utils/auth');
const { uploadImage, handleUploadError } = require('../utils/upload');

const router = express.Router();

// GET /news - Get all news with author details (admin only)
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }

    // Get news with author details
    const news = await News.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await News.countDocuments(query);

    res.json({
      success: true,
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNews: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message,
    });
  }
});

// GET /news/my - Get current user's news only
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.userId;

    // Build query for user's news only
    const query = { author: userId };
    if (category) {
      query.category = category;
    }

    // Get user's news with author details
    const news = await News.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await News.countDocuments(query);

    res.json({
      success: true,
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNews: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get my news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your news',
      error: error.message,
    });
  }
});

// GET /news/public - Get all news for public view (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }

    // Get news with author details
    const news = await News.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await News.countDocuments(query);

    res.json({
      success: true,
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNews: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get public news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message,
    });
  }
});

// POST /news - Create new news (authenticated users only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, category, image } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    // Create new news
    const news = new News({
      title,
      content,
      category,
      image,
      author: req.user.userId,
    });

    await news.save();

    // Populate author details
    await news.populate('author', 'name email role');

    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: news,
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create news',
      error: error.message,
    });
  }
});

// DELETE /news/:id - Delete news (admin or author only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Find the news
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    // Check if user is admin or the author
    if (userRole !== 'admin' && news.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin or author can delete this news',
      });
    }

    // Delete the news
    await News.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'News deleted successfully',
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news',
      error: error.message,
    });
  }
});

// GET /news/search?q=query - Search news by title or content (public)
router.get('/search', async (req, res) => {
  try {
    const { q: query, page = 1, limit = 10, category } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {
      $text: { $search: query },
    };

    // Add category filter if provided
    if (category) {
      searchQuery.category = category;
    }

    // Search news with text score for relevance
    const news = await News.find(searchQuery, { score: { $meta: 'textScore' } })
      .populate('author', 'name email role')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await News.countDocuments(searchQuery);

    res.json({
      success: true,
      data: news,
      query: query,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Search news error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    });
  }
});

// GET /news/my/search?q=query - Search current user's news only
router.get('/my/search', authenticateToken, async (req, res) => {
  try {
    const { q: query, page = 1, limit = 10, category } = req.query;
    const userId = req.user.userId;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const skip = (page - 1) * limit;

    // Build search query for user's news only
    const searchQuery = {
      $text: { $search: query },
      author: userId,
    };

    // Add category filter if provided
    if (category) {
      searchQuery.category = category;
    }

    // Search user's news with text score for relevance
    const news = await News.find(searchQuery, { score: { $meta: 'textScore' } })
      .populate('author', 'name email role')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await News.countDocuments(searchQuery);

    res.json({
      success: true,
      data: news,
      query: query,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Search my news error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    });
  }
});

// GET /news/:id - Get single news by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id).populate('author', 'name email role');

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error('Get single news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message,
    });
  }
});

// PUT /news/:id - Update news (admin or author only)
router.put(
  '/:id',
  authenticateToken,
  (req, res, next) => {
    // Accept both JSON and multipart. If Content-Type is multipart, run uploadImage
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      return uploadImage()(req, res, err => {
        if (err) return handleUploadError(err, req, res, next);
        next();
      });
    }
    next();
  },
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, category } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      // Find the news
      const news = await News.findById(id);
      if (!news) {
        return res.status(404).json({
          success: false,
          message: 'News not found',
        });
      }

      // Check if user is admin or the author
      if (userRole !== 'admin' && news.author.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only admin or author can update this news',
        });
      }

      // Build update payload
      const updatePayload = {};
      if (typeof title !== 'undefined') updatePayload.title = title;
      if (typeof content !== 'undefined') updatePayload.content = content;
      if (typeof category !== 'undefined') updatePayload.category = category;
      // If file uploaded, set image URL; else allow JSON field `image` to override/remove
      if (req.file && req.file.filename) {
        updatePayload.image = `/uploads/${req.file.filename}`;
      } else if (Object.prototype.hasOwnProperty.call(req.body, 'image')) {
        updatePayload.image = req.body.image; // can be empty string to clear
      }

      const updatedNews = await News.findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      }).populate('author', 'name email role');

      res.json({
        success: true,
        message: 'News updated successfully',
        data: updatedNews,
      });
    } catch (error) {
      console.error('Update news error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update news',
        error: error.message,
      });
    }
  }
);

module.exports = router;
// Admin-only: delete all news by a specific author
router.delete(
  '/by-author/:userId',
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      }
      const result = await News.deleteMany({ author: userId });
      res.json({
        success: true,
        message: 'News deleted successfully for user',
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error('Bulk delete by author error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete news for user',
        error: error.message,
      });
    }
  }
);
