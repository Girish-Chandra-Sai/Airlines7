const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const Flight = require('../models/Flight'); // Make sure to import the Flight model
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('bookings')
      .populate({
        path: 'bookings.flight',
        model: 'Flight',
        select: 'flightNumber startLocation destinationLocation date'
      });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;