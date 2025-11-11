// scripts/insertFlightData.js
const mongoose = require('mongoose');
const Flight = require('../models/Flight');

mongoose.connect('mongodb+srv://mannavagirish2004_db_user:w1DjAfccvUOttJJI@cluster0.p0q4lyn.mongodb.net/?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cities = ['Delhi', 'Hyderabad', 'Mumbai', 'Bengaluru', 'Amaravathi', 'Jaipur', 'Kolkata', 'Chennai'];

const generateFlightNumber = () => {
  return 'SK' + Math.floor(1000 + Math.random() * 9000);
};

const generateTime = () => {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  return { hours, minutes };
};

const generateDuration = () => {
  const hours = Math.floor(1 + Math.random() * 3);
  const minutes = Math.floor(Math.random() * 60);
  return { hours, minutes };
};

const calculateDestinationTime = (startTime, duration) => {
  let destHours = startTime.hours + duration.hours;
  let destMinutes = startTime.minutes + duration.minutes;
  
  if (destMinutes >= 60) {
    destHours += Math.floor(destMinutes / 60);
    destMinutes %= 60;
  }
  
  destHours %= 24;
  
  return { hours: destHours, minutes: destMinutes };
};

const formatTime = (time) => {
  return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
};

const generatePrice = () => {
  return Math.floor(2000 + Math.random() * 8000);
};

const generateSeats = () => {
  return Array.from({ length: 70 }, (_, i) => ({
    seatNumber: i + 1,
    isBooked: false,
    userId: null
  }));
};

const insertFlights = async () => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 3);

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    for (let i = 0; i < cities.length; i++) {
      for (let j = 0; j < cities.length; j++) {
        if (i !== j) {
          const startTime = generateTime();
          const duration = generateDuration();
          const destinationTime = calculateDestinationTime(startTime, duration);

          const flight = new Flight({
            flightNumber: generateFlightNumber(),
            startLocation: cities[i],
            destinationLocation: cities[j],
            startTime: formatTime(startTime),
            destinationTime: formatTime(destinationTime),
            duration: `${duration.hours}h ${duration.minutes}m`,
            price: generatePrice(),
            seats: generateSeats(),
            date: new Date(date)
          });
          
          try {
            await flight.save();
            console.log(`Flight created: ${flight.flightNumber} from ${flight.startLocation} to ${flight.destinationLocation} on ${flight.date.toDateString()}`);
          } catch (error) {
            console.error(`Error creating flight: ${error.message}`);
          }
        }
      }
    }
  }
  console.log('Flight data insertion completed');
  mongoose.connection.close();
};

insertFlights();