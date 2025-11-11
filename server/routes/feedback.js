// routes/feedback.js
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Flight = require('../models/Flight');

router.post('/submit', async (req, res) => {
  try {
    const { flightNumber, rating, review } = req.body;

    // Check if the flight number exists
    const flight = await Flight.findOne({ flightNumber });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Create new feedback
    const feedback = new Feedback({
      flightNumber,
      rating,
      review,
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    
    const totalReviews = feedbacks.length;
    const overallRating = totalReviews > 0
      ? (feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.json({
      feedbacks,
      overallStats: {
        totalReviews,
        overallRating,
      },
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Error fetching feedbacks' });
  }
});

module.exports = router;