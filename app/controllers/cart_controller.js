// controllers/cart_controller.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id; // Assuming you have middleware to extract userId from token

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (product.stockqut < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], cartTotal: 0 });
    }

    // Check if product is already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price: product.pprice });
    }

    // Update cart total
    cart.cartTotal = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    // Populate product details
    const populatedCart = await Cart.findById(cart._id).populate("items.productId");

    res.status(200).json({
      message: "Item added to cart",
      data: populatedCart,
    });
  } catch (err) {
    console.error("Error in addCart:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const userId = req.user.id; // Fetch only the user's cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (err) {
    console.error("Error in getAll:", err);
    res.status(500).json({ error: err.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    await cart.remove();

    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (err) {
    console.error("Error in deleteCart:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addCart, getAll, deleteCart };