const express = require("express");
const router = express.Router();
const { addCart, getAll, deleteCart } = require("../controllers/cart_controller");

router.post("/add", addCart);
router.get("/", getAll);
router.delete("/:cartId", deleteCart);

module.exports = router;
