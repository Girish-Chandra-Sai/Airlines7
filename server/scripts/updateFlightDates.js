// scripts/updateFlightDates.js
const mongoose = require('mongoose');
const Flight = require('../models/Flight');
const { insertFlights } = require('./insertFlightData');

mongoose.connect('mongodb://localhost:27017/skypath', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateFlightDates = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Remove flights from yesterday and before
  await Flight.deleteMany({ date: { $lt: today } });

  // Check if we need to add new flights
  const latestFlight = await Flight.findOne().sort('-date');
  if (latestFlight) {
    const latestDate = new Date(latestFlight.date);
    latestDate.setDate(latestDate.getDate() + 1);

    if (latestDate <= new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) {
      // Insert new flights
      await insertFlights(latestDate, new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000));
    }
  }

  console.log('Flight dates updated successfully');
  mongoose.connection.close();
};

updateFlightDates();