const mongoose = require('mongoose');

const CheckoutSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    telephoneNumber: { type: String },
    mobileNumber: { type: String, required: true },
    //customer: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerProfile', required: true },
    preferredContactMethod: { type: String },
    comment: { type: String },
    cartItems: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    paymentSlipUrl: { type: String, required: true },
    agreedToTerms: { type: Boolean, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Checkout', CheckoutSchema);

