// middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const { admins } = require('../config/adminConfig');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the admin exists in our config
    const adminExists = admins.some(admin => admin.username === decoded.admin.username);
    
    if (!adminExists) {
      throw new Error('Invalid admin');
    }

    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};  