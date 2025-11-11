// models/Flight.js
const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: Number,
  isBooked: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  startLocation: { type: String, required: true },
  destinationLocation: { type: String, required: true },
  startTime: { type: String, required: true },
  destinationTime: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  seats: [seatSchema],
  date: { type: Date, required: true }
});

module.exports = mongoose.model('Flight', flightSchema);