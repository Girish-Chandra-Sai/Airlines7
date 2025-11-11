const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users'); // Ensure this path is correct
const JWT_SECRET = process.env.JWT_SECRET;



// Registration route
router.post('/register', async (req, res) => {
  const { username, name, email, password, phoneNumber } = req.body;

  // Basic input validation
  if (!username || !name || !email || !password || !phoneNumber) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  try {
    // Check if user already exists by email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    // Also check username uniqueness to avoid duplicate key errors
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'Username is already taken' });
    }

    // Create new user
    user = new User({
      username,
      name,
      email,
      password,
      phoneNumber,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Return JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' }, // Changed to 7 days
      (err, token) => {
        if (err) {
          console.error('Error signing token', err);
          return res.status(500).json({ msg: 'Error creating token' });
        }
        res.json({ token, isLoggedIn: true });
      }
    );
  } catch (err) {
    // Log full error for debugging and return clearer status codes for known errors
    console.error('Register error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ msg: 'Validation error', errors: messages });
    }

    // Duplicate key error (e.g., unique fields)
    if (err.code && err.code === 11000) {
      const dupField = Object.keys(err.keyValue || {})[0];
      return res.status(409).json({ msg: `Duplicate value for field: ${dupField}` });
    }

    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email);

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Create and send JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        console.log('Login successful, sending token');
        res.json({ token, isLoggedIn: true });
      }
    );
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server Error');
  }
});

// New route for checking authentication
router.get('/check-auth', (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.json({ isLoggedIn: false });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ isLoggedIn: true });
  } catch (error) {
    res.json({ isLoggedIn: false });
  }
});

module.exports = router;