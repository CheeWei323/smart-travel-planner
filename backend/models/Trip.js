const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    budget: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
    },

    // ✅ REQUIRED BOOKINGS (ADD THIS)
    hotel: {
      type: Boolean,
      default: false,
    },

    flight: {
      type: Boolean,
      default: false,
    },

    carRental: {
      type: Boolean,
      default: false,
    },

    activities: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);