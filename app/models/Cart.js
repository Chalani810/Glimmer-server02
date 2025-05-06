const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,  // Assuming each item is a product with a unique ID
      ref: "Product",  // Reference to Product model (you can adjust this depending on your app's structure)
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
      // You could also calculate the total based on quantity * price on the client-side, but it's useful to store it here
    },
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Cart", CartSchema);
