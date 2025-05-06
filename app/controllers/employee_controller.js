const Employee = require("../models/Employee");
const path = require("path");
const fs = require("fs");

// Add Employee
const addEmployee = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const profileImg = req.file ? `app/uploads/${req.file.filename}` : "";

    const generateEmpCode = () => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");
      const second = String(now.getSeconds()).padStart(2, "0");

      return `EMP-${month}${day}${hour}${minute}${second}`;
    };

    if (!name || !phone || !email) {
      return res.status(400).json({
        message: "Name, Phone, and Email are required",
      });
    }

    const employee = new Employee({
      empId: generateEmpCode(),
      name,
      email,
      phone,
      profileImg,
    });

    await employee.save();

    res
      .status(201)
      .json({ message: "Employee created successfully", data: employee });
  } catch (err) {
    console.error("Error in addEmployee:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get All Employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    
    const employeesWithFullPath = employees.map((employee) => ({
      ...employee.toObject(),
      profileImg: employee.profileImg 
        ? `${req.protocol}://${req.get('host')}/uploads/${employee.profileImg.split('uploads/')[1]}`
        : null
    }));

    res.status(200).json({ data: employeesWithFullPath });
  } catch (err) {
    console.error("Error in getAllEmployees:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update Employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    
    let updateData = { name, email, phone };
    
    // Handle profile image update if file is uploaded
    if (req.file) {
      updateData.profileImg = `app/uploads/${req.file.filename}`;
      
      // Delete old image if exists
      const employee = await Employee.findById(id);
      if (employee.profileImg) {
        const oldImagePath = path.join(__dirname, '../', employee.profileImg);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ 
      message: "Employee updated successfully", 
      data: updatedEmployee 
    });
  } catch (err) {
    console.error("Error in updateEmployee:", err);
    res.status(500).json({ error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findByIdAndDelete(id);
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    if (employee.profileImg) {
      const imagePath = path.join(__dirname, '../', employee.profileImg);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error in deleteEmployee:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee
};