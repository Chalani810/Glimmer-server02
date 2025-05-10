// app/models/feedbackModel.js
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, default: Date.now },
  orderId: { type: String, required: true },
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  photo: { type: String }, // File path or URL
});

module.exports = mongoose.model("Feedback", feedbackSchema);
