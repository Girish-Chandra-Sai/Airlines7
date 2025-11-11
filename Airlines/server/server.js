const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const feedbackRoutes = require('./routes/feedback');
const flights = require('./routes/flights');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const profileROutes=require('./routes/profile.js');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/feedback', feedbackRoutes);


const MONGO_URI = process.env.MONGO_URI;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in server/.env. The app needs the MongoDB connection string.');
  process.exit(1);
}

// Connect to MongoDB Atlas using the MONGO_URI from environment
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    // Mask password in logs when printing URI
    try {
      const safe = MONGO_URI.replace(/^(mongodb(\+srv)?:\/\/[^:]+:)[^@]+(@.*)$/,'$1***$3');
      console.log('Connected to MongoDB:', safe);
    } catch (e) {
      console.log('Connected to MongoDB (connection string masked)');
    }
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/schedule-reminder', async (req, res) => {
  const { email, flight, seat, fromCity, toCity } = req.body;
  const reminderDate = new Date(flight.date);
  reminderDate.setHours(reminderDate.getHours() - 6);

  schedule.scheduleJob(reminderDate, async function() {
    const mailOptions = {
      from: 'skypathairlines@gmail.com',
      to: email,
      subject: 'Flight Reminder',
      html: `
        <h2>Flight Reminder</h2>
        <p>Your flight is in 6 hours!</p>
        <p>Flight: ${flight.flightNumber}</p>
        <p>Seat: ${seat.seatNumber}</p>
        <p>From: ${fromCity || flight.startLocation}</p>
        <p>To: ${toCity || flight.destinationLocation}</p>
        <p>Date: ${new Date(flight.date).toLocaleDateString()}</p>
        <p>Departure: ${flight.startTime}</p>
        <p>Arrival: ${flight.destinationTime}</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Reminder email sent successfully');
    } catch (error) {
      console.error('Error sending reminder email:', error);
    }
  });

  res.status(200).json({ message: 'Reminder scheduled successfully' });
});

app.post('/api/send-email', async (req, res) => {
  const { email, flight, seat, fromCity, toCity, reminderType } = req.body;

  const subject = reminderType === 'reminder' ? 'Flight Reminder' : 'Booking Confirmation';
  const heading = reminderType === 'reminder' ? 'Flight Reminder' : 'Booking Confirmed';
  const extraText = reminderType === 'reminder' ? '<p>Your flight is in 6 hours!</p>' : '';

  const mailOptions = {
    from: 'skypathairlines@gmail.com',
    to: email,
    subject: subject,
    html: `
      <h2>${heading}</h2>
      ${extraText}
      <p>Flight: ${flight.flightNumber}</p>
      <p>Seat: ${seat.seatNumber}</p>
      <p>From: ${fromCity || flight.startLocation}</p>
      <p>To: ${toCity || flight.destinationLocation}</p>
      <p>Date: ${new Date(flight.date).toLocaleDateString()}</p>
      <p>Departure: ${flight.startTime}</p>
      <p>Arrival: ${flight.destinationTime}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});

app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  next();
});

app.use('/api/profile',profileROutes);
app.use('/api/flights', flights);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use("/api/airlineUser", require("./routes/airuser.js"));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something broke!', details: err.message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
