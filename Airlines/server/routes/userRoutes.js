const express = require('express');
const router = express.Router();
const User = require('../models/Users');

router.get('/:userId/bookings', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('bookings.flight');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = router;