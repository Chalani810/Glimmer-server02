const Checkout = require("../models/Checkout");
const Employee = require("../models/Employee");
const Cart = require("../models/Cart");
const Feedback = require("../models/Feedback");

// Get all orders (already partially implemented in your OrderHistory fetch)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Checkout.find()
      .populate("employees", "name")
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
      path: "employees",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const assignedEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const { empIds } = req.body;

    if (!Array.isArray(empIds)) {
      return res
        .status(400)
        .json({ message: "Employee IDs must be provided as an array" });
    }

    // Find the existing order to get previous employees
    const existingOrder = await Checkout.findById(id);

    // Find all employees (don't check availability)
    const employees = await Employee.find({
      _id: { $in: empIds },
    });

    // Check if all requested employees exist
    if (employees.length !== empIds.length) {
      const missingIds = empIds.filter(
        (id) => !employees.some((emp) => emp._id.equals(id))
      );
      return res.status(400).json({
        message: "Some employees don't exist",
        missingIds,
      });
    }

    // Update new employees' availability to false
    await Employee.updateMany(
      { _id: { $in: empIds } },
      { $set: { availability: false } }
    );

    // If there were previously assigned employees, make them available again
    if (
      existingOrder &&
      existingOrder.employees &&
      existingOrder.employees.length > 0
    ) {
      const previousEmpIds = existingOrder.employees.map(
        (emp) => emp._id || emp
      );
      // Only update those who aren't in the new assignment
      const employeesToRelease = previousEmpIds.filter(
        (id) => !empIds.includes(id.toString())
      );

      if (employeesToRelease.length > 0) {
        await Employee.updateMany(
          { _id: { $in: employeesToRelease } },
          { $set: { availability: true } }
        );
      }
    }

    const order = await Checkout.findByIdAndUpdate(
      id,
      { $set: { employees: empIds } },
      { new: true }
    ).populate({
      path: "employees",
      populate: {
        path: "occupation",
      },
    });

    if (!order) {
      // Roll back employee availability if order not found
      await Employee.updateMany(
        { _id: { $in: empIds } },
        { $set: { availability: true } }
      );
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Employees assigned successfully",
      order,
    });
  } catch (err) {
    // In case of error, make sure to roll back any availability changes
    if (empIds) {
      await Employee.updateMany(
        { _id: { $in: empIds } },
        { $set: { availability: true } }
      ).catch(console.error); // Silent fail for rollback
    }

    res.status(500).json({
      error: err.message,
      message: "Error assigning employees to order",
    });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Checkout.find({ userId })
      .populate("employees")
      .sort({ createdAt: -1 });

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
