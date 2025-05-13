const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Employee = require("../models/Employee");
const Checkout = require("../models/Checkout");
const Salary = require("../models/SalaryRecord");

const generateEmployeeReport = async (req, res) => {
  let pdfGenerated = false;

  try {
    const now = new Date();
    const reportDate = now.toLocaleDateString();
    const reportTime = now.toLocaleTimeString();

    const employees = await Employee.find().populate("occupation");
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

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
      year: currentYear,
      month: currentMonth,
      employeeId: { $exists: true, $ne: null },
    }).populate("employeeId");

    const doc = new PDFDocument({ margin: 50 });

    doc.on("error", (err) => {
      if (!pdfGenerated) {
        console.error("PDF stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "PDF generation failed" });
        }
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Employee_Report_${currentYear}_${currentMonth}.pdf`
    );

    doc.pipe(res);

    // Add header
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Employee Monthly Report", 110, 57)
      .fontSize(10)
      .text(`Generated on: ${reportDate} at ${reportTime}`, 200, 65, {
        align: "right",
      })
      .text(`Month: ${currentMonth}/${currentYear}`, 200, 80, {
        align: "right",
      })
      .moveDown();

    // Add horizontal line
    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    // Add table headers with increased width for ID and Name
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("ID", 50, 120, { width: 80 })  // Increased width from ~50 to 80
      .text("Name", 140, 120, { width: 120 })  // Increased width from ~90 to 120
      .text("Position", 270, 120, { width: 90 })  // Adjusted position
      .text("Events", 370, 120, { width: 50, align: "center" })
      .text("Salary Status", 430, 120, { width: 80, align: "center" })  // Adjusted position
      .text("Last Payment", 520, 120, { align: "right" })  // Adjusted position
      .moveDown();

    // Add employee data rows
    let y = 140;
    doc.font("Helvetica").fontSize(10);

    employees.forEach((employee) => {
      const employeeIdStr = employee._id.toString();
      const eventsCount = eventCountMap[employeeIdStr] || 0;
      const salaryRecord = salaries.find((s) => {
        return s?.employeeId?._id?.toString() === employeeIdStr;
      });

      // Employee ID with increased width
      doc.text(employee.empId, 50, y, { width: 80 });

      // Employee Name with increased width
      doc.text(employee.name, 140, y, { width: 120 });

      // Position (adjusted position)
      doc.text(employee.occupation?.title || "N/A", 270, y, { width: 90 });

      // Events Count (adjusted position)
      doc.text(eventsCount.toString(), 370, y, { width: 50, align: "center" });

      // Salary Status (adjusted position)
      const salaryStatus = salaryRecord ? "Paid" : "Pending";
      const statusColor = salaryRecord ? "#00AA00" : "#FF0000";
      doc
        .fillColor(statusColor)
        .text(salaryStatus, 430, y, { width: 80, align: "center" })
        .fillColor("#444444");

      // Last Payment Date (adjusted position)
      if (salaryRecord) {
        const paymentDate = new Date(
          salaryRecord.createdAt
        ).toLocaleDateString();
        doc.text(paymentDate, 520, y, { align: "right" });
      } else {
        doc.text("N/A", 520, y, { align: "right" });
      }

      y += 20;

      // Add page if we're at the bottom
      if (y > 750) {
        doc.addPage();
        y = 100;

        // Repeat headers on new page with new widths
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("ID", 50, y, { width: 80 })
          .text("Name", 140, y, { width: 120 })
          .text("Position", 270, y, { width: 90 })
          .text("Events", 370, y, { width: 50, align: "center" })
          .text("Salary Status", 430, y, { width: 80, align: "center" })
          .text("Last Payment", 520, y, { align: "right" });

        y = 120;
        doc.font("Helvetica");
      }
    });

    // Add summary section
    doc
      .addPage()
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Monthly Summary", 50, 80)
      .moveDown();

    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Total Employees: ${employees.length}`, 50, 120)
      .text(`Total Events Completed: ${checkouts.length}`, 50, 140)
      .text(`Employees Paid: ${salaries.length}`, 50, 160)
      .text(
        `Employees Pending Payment: ${employees.length - salaries.length}`,
        50,
        180
      );

    // Add footer
    doc
      .fontSize(8)
      .text("© 2023 Your Company Name. All rights reserved.", 50, 780, {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF report" });
  }
};

module.exports = {
  generateEmployeeReport,
};
