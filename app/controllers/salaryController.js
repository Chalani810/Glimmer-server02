const Salary = require('../models/SalaryRecord');
const Employee = require('../models/Employee');

const createSalary = async (req, res) => {
  try {
    const { employeeId, year, month, basicSalary, handledEvents, eventBonus, totalSalary } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ 
        message: 'Employee not found' 
      });
    }

    const existingSalary = await Salary.findOne({ employeeId, year, month });
    if (existingSalary) {
      return res.status(400).json({ 
        message: 'Salary record already exists for this employee and month' 
      });
    }

    const salary = new Salary({
      employeeId,
      year,
      month,
      basicSalary,
      handledEvents,
      eventBonus,
      totalSalary
    });

    const savedSalary = await salary.save();
    
    res.status(201).json({ 
      message: 'Salary created successfully', 
      data: savedSalary 
    });
  } catch (err) {
    console.error('Error in createSalary:', err);
    res.status(500).json({ 
      error: err.message 
    });
  }
};

const getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate('employeeId', 'name empId occupation')
      .sort({ year: -1, month: -1 });

    res.status(200).json({ 
      data: salaries 
    });
  } catch (err) {
    console.error('Error in getAllSalaries:', err);
    res.status(500).json({ 
      error: err.message 
    });
  }
};
module.exports = {
  createSalary,
  getAllSalaries,
}; 