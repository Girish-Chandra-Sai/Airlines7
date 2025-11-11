const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
  },
  bookings: [{ 
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
    seatNumber: Number,
    bookingDate: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Users', UsersSchema);