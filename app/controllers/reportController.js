const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Employee = require("../models/Employee");
const Checkout = require("../models/Checkout");
const Salary = require("../models/SalaryRecord");

const generateEmployeeReport = async (req, res) => {
  const PDFDocument = require("pdfkit");

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

    const doc = new PDFDocument({ margin: 40, size: "A4" });

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
      .fontSize(12)
      .text("  | Monthly Employee Report", { align: "left" });

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
      .text("Name", 120, startY)
      .text("Position", 250, startY)
      .text("Events", 330, startY)
      .text("Status", 390, startY)
      .text("Last Payment", 470, startY);

    doc
      .moveTo(40, startY + 12)
      .lineTo(555, startY + 12)
      .strokeColor(red)
      .stroke();

    // === Table Rows ===
    let y = startY + 18;
    doc.font("Helvetica").fontSize(8);

    employees.forEach((employee) => {
      const empId = employee._id.toString();
      const eventsCount = eventCountMap[empId] || 0;
      const salary = salaries.find(
        (s) => s?.employeeId?._id?.toString() === empId
      );

      const status = salary ? "Paid" : "Pending";
      const statusColor = salary ? green : red;
      const paymentDate = salary
        ? new Date(salary.createdAt).toLocaleDateString()
        : "N/A";

      doc
        .fillColor("black")
        .text(employee.empId, 40, y)
        .text(employee.name, 120, y)
        .text(employee.occupation?.title || "N/A", 250, y)
        .text(eventsCount.toString(), 330, y)
        .fillColor(statusColor)
        .text(status, 390, y)
        .fillColor("black")
        .text(paymentDate, 470, y);

      y += 14;
    });

    // === Summary Line ===
    doc
      .moveDown()
      .moveTo(40, y + 5)
      .lineTo(555, y + 5)
      .strokeColor(red)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("black")
      .text(`Total Employees: ${employees.length}`, 40, y + 10)

    // === Footer ===
    doc
      .fontSize(7)
      .fillColor("gray")
      .text("© 2025 Glimmer Inc. — All rights reserved", 40, 800, {
        align: "center",
        width: 520,
      });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF report" });
    }
  }
};

module.exports = {
  generateEmployeeReport,
};
