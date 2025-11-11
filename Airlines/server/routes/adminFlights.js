// routes/adminFlights.js
const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const adminAuth = require('../middlewares/adminAuth');

// Get all flights (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const flights = await Flight.find();
    res.json(flights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific flight (admin only)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json(flight);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new flight (admin only)
router.post('/', adminAuth, async (req, res) => {
  const flight = new Flight(req.body);
  try {
    const newFlight = await flight.save();
    res.status(201).json(newFlight);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a flight (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updatedFlight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFlight);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a flight (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flight deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;