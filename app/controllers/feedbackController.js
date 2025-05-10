// app/controllers/feedbackController.js
const Feedback = require("../models/feedbackModel");

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { userName, email, orderId, message, rating } = req.body;
    const photo = req.file?.filename;

    const newFeedback = new Feedback({
      userName,
      email,
      orderId,
      message,
      rating,
      photo,
    });

    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all feedbacks
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ date: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (req.file) {
      updateData.photo = req.file.filename;
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
