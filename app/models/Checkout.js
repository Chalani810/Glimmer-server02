// models/Checkout.js

const mongoose = require("mongoose");

const CheckoutSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  address: {
    type: String,
    required: false,
  },
  telephone: {
    type: String,
    required: false,
  },
  mobile: {
    type: String,
    required: false,
  },
  contactMethod: {
    type: String,
    enum: ['message', 'call', 'email'],
    required: false,
  },

  guestcount: {
    type: String,
    enum: ['less than 50', '50-100', 'more than 100'],  
    required: false,
  },
  
  comment: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
    default: "Pending",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  advancePayment: {
    type: Number,
    required: false,
  },
  slipUrl: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Checkout", CheckoutSchema);
