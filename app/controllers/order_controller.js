const Order = require("../models/Order");
const Employee = require("../models/Employee");

// Get all orders (already partially implemented in your OrderHistory fetch)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("assignedEmployees", "firstName lastName");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["Pending", "Completed", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("assignedEmployees", "firstName lastName");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign employees to an order
const assignEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeIds } = req.body; // Array of employee IDs
    const employees = await Employee.find({ _id: { $in: employeeIds } });
    if (employees.length !== employeeIds.length) {
      return res.status(400).json({ message: "One or more employee IDs are invalid" });
    }
    const order = await Order.findByIdAndUpdate(
      id,
      { assignedEmployees: employeeIds },
      { new: true }
    ).populate("assignedEmployees", "firstName lastName");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllOrders, updateOrderStatus, assignEmployees };