const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  register,
  login,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  checkExistingUser,
  toggleUserStatus,
  updateLoyaltyPoints
} = require("../controllers/auth_controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const uploadPath = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Public routes
router.post("/register", upload.single("profilePicture"), register);
router.post("/login", login);
router.get("/check-user", checkExistingUser);

// Protected routes (require authentication)
router.use(authMiddleware);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", upload.single("profilePicture"), updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.patch("/users/:id/loyalty-points", updateLoyaltyPoints);

module.exports = router;