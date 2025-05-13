// Glimmer-server02/app/models/Feedback.js
const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: false // Optional for guest feedbacks
  },
  userName: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true,
    match: [/^ORD-\d+$/, 'Please enter a valid order ID format (ORD-XXXXXX)']
  },
  eventName: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  photoUrl: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
FeedbackSchema.index({ userId: 1 });
FeedbackSchema.index({ orderId: 1 });
FeedbackSchema.index({ rating: 1 });
FeedbackSchema.index({ date: -1 });

module.exports = mongoose.model("Feedback", FeedbackSchema);