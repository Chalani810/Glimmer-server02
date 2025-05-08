const Cart = require("../models/Cart");  // Import Cart model

// Function to add items to the cart
const addCart = async (req, res) => {
  try {
    const { items, subtotal } = req.body;  // Assuming items and subtotal are passed in the request body

    // Create a new cart entry
    const newCart = new Cart({
      items,
      subtotal
    });

    // Save the cart in the database
    await newCart.save();

    res.status(201).json({
      message: "Cart created successfully",
      data: newCart,
    });
  } catch (err) {
    console.error("Error in addCart:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// Function to get all cart details (you may adjust this if you need it to be user-specific)
const getAll = async (req, res) => {
  try {
    const carts = await Cart.find();  // You could filter by user ID here if you have user authentication

    res.status(200).json({
      message: "Cart details fetched successfully",
      data: carts,
    });
  } catch (err) {
    console.error("Error in getAll:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// Function to delete a specific cart (optional)
const deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    await cart.remove();

    res.status(200).json({
      message: "Cart deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteCart:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

module.exports = {
  addCart,
  getAll,
  deleteCart,
};
