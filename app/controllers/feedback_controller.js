const Feedback = require("../models/Feedback");
const User = require("../models/User");
const path = require("path");	
const fs = require("fs");
const { log } = require("console");

const mongoose = require("mongoose");

const addFeedback = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      orderId,
      eventName,
      message,
      rating,
    } = req.body;

    const userId = req.user?._id || null;
    const userName = `${firstName} ${lastName}`;
    
    // Handle file upload
    const photoUrl = req.file ? `app/uploads/${req.file.filename}` : '';

    // Validation
    if (!firstName || !lastName || !orderId || !eventName || !message || !rating) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      userId,
      userName,
      orderId,
      eventName,
      message,
      rating,
      photo: photoUrl,
      date: new Date()
    });

    await newFeedback.save();

    res.status(201).json({ 
      message: "Feedback submitted successfully", 
      data: newFeedback 
    });
  } catch (err) {
    console.error("Error in addFeedback:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ date: -1 });
    
    // Convert photo paths to full URLs if they exist
    const feedbacksWithFullPath = feedbacks.map(feedback => {
      const result = {
        ...feedback.toObject()
      };

      if (feedback.photo) {
        try {
          const splitUrl = feedback.photo.split('uploads/');
          if (splitUrl.length > 1) {
            result.photo = `${req.protocol}://${req.get('host')}/uploads/${splitUrl[1]}`;
          } else {
            result.photo = feedback.photo;
          }
        } catch (error) {
          result.photo = feedback.photo;
        }
      }

      return result;
    });
    
    res.status(200).json(feedbacksWithFullPath);
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve feedbacks", 
      error: err.message
    });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      orderId,
      eventName,
      message,
      rating,
    } = req.body;

    const userName = `${firstName} ${lastName}`;
    
    // Find existing feedback
    const existingFeedback = await Feedback.findById(id);
    if (!existingFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Handle file upload (if new file is uploaded)
    let photoUrl = existingFeedback.photo;
    if (req.file) {
      // Delete old photo if it exists
      if (existingFeedback.photo) {
        const filePath = path.join(__dirname, "../..", existingFeedback.photo);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      photoUrl = `app/uploads/${req.file.filename}`;
    }

    // Update feedback
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      {
        userName,
        orderId,
        eventName,
        message,
        rating,
        photo: photoUrl
      },
      { new: true }
    );

    res.status(200).json({ 
      message: "Feedback updated successfully", 
      data: updatedFeedback 
    });
  } catch (err) {
    console.error("Error updating feedback:", err);
    res.status(500).json({ 
      message: "Failed to update feedback", 
      error: err.message 
    });
  }
};

const deleteFeedback = async (req, res) => {
  try { 
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Delete associated photo if it exists
    if (feedback.photo) {
      const filePath = path.join(__dirname, "../..", feedback.photo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Feedback.findByIdAndDelete(id);

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete feedback", 
      error: err.message
    });
  }
}; 

const getUserFeedbacks = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const feedbacks = await Feedback.find({ userId }).sort({ date: -1 });
    
    // Convert photo paths to full URLs if they exist
    const feedbacksWithFullPath = feedbacks.map(feedback => {
      const result = {
        ...feedback.toObject()
      };

      if (feedback.photo) {
        try {
          const splitUrl = feedback.photo.split('uploads/');
          if (splitUrl.length > 1) {
            result.photo = `${req.protocol}://${req.get('host')}/uploads/${splitUrl[1]}`;
          } else {
            result.photo = feedback.photo;
          }
        } catch (error) {
          result.photo = feedback.photo;
        }
      }

      return result;
    });
    
    res.status(200).json(feedbacksWithFullPath);
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve user feedbacks", 
      error: err.message
    });
  }
};

module.exports = {
  addFeedback,
  getAllFeedbacks,
  updateFeedback,
  deleteFeedback,
  getUserFeedbacks
};