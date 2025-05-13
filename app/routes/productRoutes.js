const express = require("express");
const { addProduct, getAllProducts, deleteProduct, getProductsByEventId,updateProduct } = require("../controllers/product_controller");

const router = express.Router();


const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware"); // if needed
const Product = require("../models/Product");


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
router.put("/:productId", upload.single("productImage"), updateProduct);
router.get('/by-event/:eventId', getProductsByEventId);


module.exports = router;
