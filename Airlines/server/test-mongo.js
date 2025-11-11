// Small script to test MongoDB connection using the MONGO_URI in server/.env
// Usage: from server folder run: node test-mongo.js

require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('MONGO_URI not found in environment. Check server/.env');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB using URI from .env (sensitive parts hidden)');
try {
  const safe = uri.replace(/^(mongodb\+srv:\/\/[^:]+:)[^@]+(@.*)$/,'$1***$2');
  console.log('Using:', safe);
} catch (e) {
  console.log('Using MONGO_URI (not printed for safety)');
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    return mongoose.connection.close();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('MongoDB connection error:');
    console.error(err);
    process.exit(1);
  });
