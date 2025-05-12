// routes/cart.js
const express = require("express");
const router = express.Router();
const { addCart, getAll, deleteCart } = require("../controllers/cart_controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, addCart);
router.get("/", authMiddleware, getAll);
router.delete("/:cartId", authMiddleware, deleteCart);

module.exports = router;