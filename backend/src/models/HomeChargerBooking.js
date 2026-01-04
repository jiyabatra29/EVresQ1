const mongoose = require("mongoose");

const homeChargerBookingSchema = new mongoose.Schema({
  EVowner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EVowner",
    required: true
  },

  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Host",
    required: true
  },

  timeSlot: {
    type: String,
    required: true   // "14:00-15:00"
  },

  chargerType: {
    type: String,
    enum: ["slow", "fast"],
    required: true
  },

  status: {
    type: String,
    enum: [
      "requested",
      "approved",
      "rejected",
      "charging",
      "completed"
    ],
    default: "requested"
  },

  price: Number,
  latitude: { type: Number },
  longitude: { type: Number },
  updatedAt: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model("HomeChargerBooking", homeChargerBookingSchema);