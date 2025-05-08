const User = require("../models/User");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check for existing email or phone
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { phone }
      ]
    });

    if (existingUser) {
      let message = "User already exists";
      if (existingUser.email === email) {
        message = "It looks like you're already registered. Please sign in with your credentials.";
      } else if (existingUser.phone === phone) {
        message = "It looks like you're already registered. Please sign in with your credentials.";
      }
      return res.status(400).json({ message });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      profilePicture: req.file ? req.file.filename : null,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const currentUser = await User.findById(id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email or phone is being updated to an existing value
    if (updates.email || updates.phone) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: id } }, // Exclude current user
          { 
            $or: [
              { email: updates.email || currentUser.email },
              { phone: updates.phone || currentUser.phone }
            ]
          }
        ]
      });

      if (existingUser) {
        let message = "Update would create duplicate user";
        if (existingUser.email === (updates.email || currentUser.email)) {
          message = "Email is already registered to another account.";
        } else if (existingUser.phone === (updates.phone || currentUser.phone)) {
          message = "Phone number is already registered to another account.";
        }
        return res.status(400).json({ message });
      }
    }

    if (req.file) {
      // Delete old profile picture if it exists
      if (currentUser.profilePicture) {
        const oldImagePath = path.join(__dirname, "../../uploads", currentUser.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updates.profilePicture = req.file.filename;
    }

    if (updates.address) {
      updates.address = {
        street: updates.address.street || currentUser.address.street,
        city: updates.address.city || currentUser.address.city,
        postalCode: updates.address.postalCode || currentUser.address.postalCode,
        country: updates.address.country || currentUser.address.country
      };
    }

    if (updates.password) {
      return res
        .status(400)
        .json({ message: "Use the change password route to update password" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by _id instead of userId
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete profile picture if it exists
    if (user.profilePicture) {
      const imagePath = path.join(__dirname, "../../uploads", user.profilePicture);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};