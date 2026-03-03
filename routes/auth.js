const express = require('express');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../utils/auth');
const { authorizeAdmin } = require('../utils/auth');

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Determine role: first user becomes admin OR ADMIN_EMAIL matches
    let role = 'client';
    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      role = 'admin';
    } else if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase() === email.toLowerCase()) {
      role = 'admin';
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({ 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Compare password using bcryptjs
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = generateToken({ 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
});

// Current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Admin: list all users
router.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

module.exports = router;
