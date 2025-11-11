// routes/flights.js
const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

router.get('/', async (req, res) => {
  try {
    const { fromCity, toCity, travelDate } = req.query;
    const date = new Date(travelDate);
    const flights = await Flight.find({
      startLocation: fromCity,
      destinationLocation: toCity,
      date: {
        $gte: new Date(date.setHours(0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59))
      }
    });
    res.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ message: 'Error fetching flights' });
  }
});

router.get('/:flightNumber/seats', async (req, res) => {
  try {
    const flight = await Flight.findOne({ flightNumber: req.params.flightNumber });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight.seats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seats', error: error.message });
  }
});

module.exports = router;