const express = require("express");
const multer = require("multer");
const { addCheckout,getAll,deleteCheckout } = require("../controllers/checkout_controller");
const authMiddleware = require("../middleware/authMiddleware");
const Checkout = require("../models/Checkout");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "app/uploads/"); // Directory to save the uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Unique filename
    },
    });

const upload = multer({ storage: storage });

router.post("/add", addCheckout);
router.get("/getAll", getAll);
router.delete("/delete/:id", deleteCheckout);

module.exports = router;
