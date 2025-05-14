const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Employee = require("../models/Employee");
const Checkout = require("../models/Checkout");
const Salary = require("../models/SalaryRecord");

const generateEmployeeReport = async (req, res) => {
  let doc;
  try {
    const now = new Date();
    const reportDate = now.toLocaleDateString();
    const reportTime = now.toLocaleTimeString();

    const employees = await Employee.find().populate("occupation");

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const checkouts = await Checkout.find({
      createdAt: { $gte: firstDay, $lte: lastDay },
      status: "Completed",
    });

    const eventCountMap = {};
    checkouts.forEach((checkout) => {
      checkout.employees?.forEach((empId) => {
        const idStr = empId?.toString();
        if (idStr) eventCountMap[idStr] = (eventCountMap[idStr] || 0) + 1;
      });
    });

    const salaries = await Salary.find({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      employeeId: { $exists: true, $ne: null },
    }).populate("employeeId");

    doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Employee_Report_${now.getFullYear()}_${
        now.getMonth() + 1
      }.pdf`
    );

    doc.pipe(res);

    // === Colors ===
    const red = "#cc0000";
    const green = "#009900";

    // === Header ===
    doc
      .fillColor(red)
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("Glim", { continued: true })
      .fillColor("black")
      .text("mer", { continued: true })
      .font("Helvetica")
      .fontSize(18)
      .text(" | Monthly Employee Report", { align: "left" }); // Changed title to match employee report

    doc
      .moveDown()
      .fontSize(9)
      .fillColor("gray")
      .text(`Generated on ${reportDate} at ${reportTime}`, { align: "left" });

    doc
      .moveDown()
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .strokeColor(red)
      .stroke();

// === Table Header ===
const startY = doc.y + 10;
doc
  .font("Helvetica-Bold")
  .fillColor("black")
  .fontSize(9)
  .text("ID", 40, startY)                
  .text("Name", 100, startY)             
  .text("Position", 200, startY)         
  .text("Events", 320, startY)           
  .text("Status", 380, startY)           
  .text("Last Payment", 450, startY);    

    doc
      .moveTo(40, startY + 12)
      .lineTo(555, startY + 12)
      .strokeColor(red)
      .stroke();

// === Table Rows ===
let currentY = startY + 18;
doc.font("Helvetica").fontSize(8);

employees.forEach((employee) => {
  const empId = employee._id.toString();
  const eventsCount = eventCountMap[empId] || 0;
  const salary = salaries.find((s) => s?.employeeId?._id?.toString() === empId);

  const status = salary ? "Paid" : "Pending";
  const statusColor = salary ? green : red;
  const paymentDate = salary
    ? new Date(salary.createdAt).toLocaleDateString()
    : "N/A";

  doc
    .fillColor("black")
    .text(employee.empId, 40, currentY)
    .text(employee.name, 110, currentY, { width: 90 })  
    .text(employee.occupation?.title || "N/A", 200, currentY, { width: 110 }) 
    .text(eventsCount.toString(), 320, currentY, { width: 50, align: 'center' })
    .fillColor(statusColor)
    .text(status, 380, currentY, { width: 60, align: 'center' })
    .fillColor("black")
    .text(paymentDate, 450, currentY, { width: 100, align: 'right' });

  currentY += 14;
});

    // === Summary Line ===
    doc
      .moveDown()
      .moveTo(40, currentY + 5)
      .lineTo(555, currentY + 5)
      .strokeColor(red)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("black")
      .text(`Total Employees: ${employees.length}`, 40, currentY + 10);

    // === Footer ===
    const footerY = Math.max(currentY + 60, 750); // Changed from orderY to currentY
    doc.fontSize(8)
      .fillColor("gray")
      .text("© 2025 Glimmer Inc. - All rights reserved", 
        40, footerY, { 
          align: "center",
          width: 500
        });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    if (doc) doc.end(); // Ensure the document is properly closed
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to generate PDF report",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
};

module.exports = {
  generateEmployeeReport,
};