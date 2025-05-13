const Checkout = require("../models/Checkout");
const Employee = require("../models/Employee");
const Feedback = require("../models/Feedback");

// Get all orders (already partially implemented in your OrderHistory fetch)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Checkout.find()
      .populate("assignedEmployees", "name")
      .populate("eventId", "title date")
      .populate("items.productId", "name price photoUrl");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedEmployees } = req.body;
    if (!["Pending", "Completed", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (assignedEmployees && assignedEmployees.length > 0) {
      const validEmployees = await Employee.find({
        _id: { $in: assignedEmployees },
      });
      if (validEmployees.length !== assignedEmployees.length) {
        return res
          .status(400)
          .json({ message: "One or more employee IDs are invalid" });
      }
    }

    const updateFields = { status };
    if (assignedEmployees) {
      updateFields.assignedEmployees = assignedEmployees;
    }

    const order = await Checkout.findByIdAndUpdate(
      id,
      { status, assignedEmployees }, // Update both fields
      { new: true }
    ).populate({
      path: "assignedEmployees",
      select: "name",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign employees to an order
const assignedEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const { empIds } = req.body; // Array of employee IDs
    const employees = await Employee.find({ _id: { $in: empIds } });
    if (employees.length !== empIds.length) {
      return res
        .status(400)
        .json({ message: "One or more employee IDs are invalid" });
    }
    const order = await Checkout.findByIdAndUpdate(
      id,
      { assignedEmployees: empIds },
      { new: true }
    ).populate("assignedEmployees", "name");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get orders by user ID
const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Checkout.find({ userId }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    // For each order, check if there's a feedback entry
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const feedbackExists = await Feedback.exists({ orderId: order._id });
        return {
          ...order.toObject(),
          hasFeedback: !!feedbackExists,
        };
      })
    );

    res.json(enrichedOrders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({
      error: "Failed to fetch orders",
      details: err.message,
    });
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  assignedEmployees,
  getOrdersByUser,
};
