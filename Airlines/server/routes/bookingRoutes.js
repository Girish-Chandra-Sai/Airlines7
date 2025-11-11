// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const User = require('../models/Users');

router.post('/', async (req, res) => {
  try {
    const { flightNumber, seatNumber, email } = req.body;

    // Find the flight
    const flight = await Flight.findOne({ flightNumber });
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    // Find the seat
    const seat = flight.seats.find(s => s.seatNumber === seatNumber);
    if (!seat) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }
    if (seat.isBooked) {
      return res.status(400).json({ success: false, message: 'Seat is already booked' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Book the seat
    seat.isBooked = true;
    seat.userId = user._id; // Use userId instead of bookedBy
    await flight.save();

    // Update user's bookings
    user.bookings.push({
      flightNumber: flight.flightNumber,
      seatNumber: seatNumber,
      bookingDate: new Date()
    });
    await user.save();

    res.json({ 
      success: true, 
      message: 'Booking successful', 
      booking: { 
        flightNumber, 
        seatNumber, 
        email,
        userId: user._id
      } 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

module.exports = router;