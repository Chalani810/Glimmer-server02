const express = require("express");
const router = express.Router();
const { getAllProducts, addProduct, deleteProduct } = require("../controllers/product_controller");

router.get("/product", getAllProducts);
router.post("/product", addProduct);
router.delete("/product/:productId", deleteProduct);

module.exports = router;
