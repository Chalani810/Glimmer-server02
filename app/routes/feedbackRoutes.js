// app/routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createFeedback,
  getAllFeedbacks,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.get("/", getAllFeedbacks);
router.post("/", upload.single("photo"), createFeedback);
router.put("/:id", upload.single("photo"), updateFeedback);
router.delete("/:id", deleteFeedback);

module.exports = router;
