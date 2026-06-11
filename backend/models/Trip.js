const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: String,
  address: String,
  lat: Number,
  lon: Number
}, { _id: false });

const tripSchema = new mongoose.Schema(
  {
    // Links the trip to the specific user who created it
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    itinerary: {
      dailyHotels: {
        type: Map,
        of: locationSchema,
        default: {}
      },
      days: {
        type: Map,
        of: [locationSchema],
        default: {}
      }
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);