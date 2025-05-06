const express = require("express");
const multer = require("multer");
const { addProduct, getAllProducts, deleteProduct } = require("../controllers/product_controller");
const authMiddleware = require("../middleware/authMiddleware"); // if needed
const Product = require("../models/Product");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "app/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.post("/add", upload.single("productImage"), addProduct);
router.get("/", getAllProducts);
router.delete("/:productId", deleteProduct);

module.exports = router;
