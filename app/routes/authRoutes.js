const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
} = require("../controllers/auth_controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const uploadPath = path.join(__dirname, "../../app/uploads");
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

router.post("/register", upload.single("profilePicture"), register);
router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/users/:id", getUserById);
router.put("/users/:id", upload.single("profilePicture"), updateUser);

module.exports = router;