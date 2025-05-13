// Glimmer-server02/app/routes/feedbackRoutes.js
const express = require("express");
const multer = require("multer");
const {
  addFeedback,
  getAllFeedbacks,
  updateFeedback,
  deleteFeedback,
  getUserFeedbacks,
} = require("../controllers/feedback_controller");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "app/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.match(/^image/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  }
});

// Public routes
router.get("/", getAllFeedbacks);  

// Protected routes (require authentication)
router.post("/", upload.single("photo"), addFeedback);
router.get("/user", authMiddleware, getUserFeedbacks); 
router.put("/:id", authMiddleware, upload.single("photo"), updateFeedback); 
router.delete("/:id", authMiddleware, deleteFeedback); 

module.exports = router;