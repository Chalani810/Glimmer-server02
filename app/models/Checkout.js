// models/Checkout.js

const mongoose = require("mongoose");

const CheckoutSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: false,
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
    enum: ['Email', 'call', 'Mobile', 'Other'],
    required: false,
  },
  comment: {
    type: String,
    required: false,
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
