const PDFDocument = require("pdfkit");
const Product = require("../models/Product");
const Checkout = require("../models/Checkout");

const generateProductReport = async (req, res) => {
  try {
    // 1. Setup and Initial Data Fetching
    const now = new Date();
    const [products, checkouts] = await Promise.all([
      Product.find().lean(),
      Checkout.find({
        createdAt: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        },
        status: "Completed"
      }).populate("cart.items.productId").lean()
    ]);

    if (!products.length) {
      return res.status(404).json({ error: "No products found" });
    }

    // 2. Process Order Data
    const productStats = new Map();
    
    checkouts.forEach(checkout => {
      checkout.cart?.items?.forEach(item => {
        if (!item.productId) return;
        
        const productId = item.productId._id.toString();
        const current = productStats.get(productId) || {
          name: item.productId.pname,
          price: item.productId.pprice,
          totalEvents: 0,       // Number of events this product was ordered in
          totalQuantity: 0,     // Total quantity ordered across all events
          perEventQuantities: {} // Track quantities per event
        };
        
        // Increment event count if this is first time in current checkout
        if (!current.perEventQuantities[checkout._id]) {
          current.totalEvents += 1;
        }
        
        // Track quantity for this event
        current.perEventQuantities[checkout._id] = 
          (current.perEventQuantities[checkout._id] || 0) + (item.quantity || 1);
        current.totalQuantity += (item.quantity || 1);
        
        productStats.set(productId, current);
      });
    });

    // 3. Prepare Report Data
    const reportData = products.map(product => {
      const stats = productStats.get(product._id.toString()) || {
        name: product.pname,
        price: product.pprice,
        totalEvents: 0,
        totalQuantity: 0,
        avgPerEvent: 0
      };
      
      // Calculate average quantity per event
      const avgPerEvent = stats.totalEvents > 0 
        ? (stats.totalQuantity / stats.totalEvents).toFixed(2)
        : 0;
      
      return {
        name: stats.name || "N/A",
        events: stats.totalEvents,
        price: stats.price ? `LKR ${stats.price.toFixed(2)}` : "N/A",
        totalQuantity: stats.totalQuantity,
        avgPerEvent: avgPerEvent
      };
    }).sort((a, b) => b.totalQuantity - a.totalQuantity); // Sort by most rented

    // Find most rented product
    const mostRentedProduct = reportData.length > 0 ? reportData[0] : null;

    // 4. Generate PDF
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Product_Orders_Report_${now.getTime()}.pdf`
    );

    doc.pipe(res);

    // 5. PDF Header
    doc.fillColor("#cc0000")
       .font("Helvetica-Bold")
       .fontSize(24)
       .text("Customer Product Orders Report", { align: "left" })
       .moveDown()
       .fontSize(10)
       .fillColor("black")
       .text(`Report Period: ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, { align: "left" });

    // Highlight Most Rented Product
    if (mostRentedProduct) {
      doc.moveDown()
         .fillColor("#cc0000")
         .font("Helvetica-Bold")
         .text("Most Rented Product:", { continued: true })
         .fillColor("black")
         .font("Helvetica")
         .text(` ${mostRentedProduct.name} (${mostRentedProduct.totalQuantity} units across ${mostRentedProduct.events} events)`);
    }

    doc.moveTo(40, doc.y + 10)
       .lineTo(550, doc.y + 10)
       .stroke("#cc0000");

    // 6. Main Table
    const tableTop = doc.y + 20;
    const colWidths = [180, 90, 90, 90, 90];
    const headers = ["Product", "Events", "Price", "Total Qty", "Avg/Event"];
    
    // Table Header
    doc.font("Helvetica-Bold")
       .fontSize(10);
    
    let x = 40;
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop);
      x += colWidths[i];
    });

    doc.moveTo(40, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke("#cc0000");

    // Table Rows
    doc.font("Helvetica")
       .fontSize(9);
    
    let y = tableTop + 25;
    reportData.forEach(row => {
      doc.text(row.name, 40, y, { width: colWidths[0], ellipsis: true })
         .text(row.events.toString(), 220, y)
         .text(row.price, 310, y)
         .text(row.totalQuantity.toString(), 400, y)
         .text(row.avgPerEvent, 490, y);
      y += 20;
    });

    // 7. Summary Section
    const totals = reportData.reduce((acc, row) => ({
      events: acc.events + row.events,
      quantity: acc.quantity + row.totalQuantity
    }), { events: 0, quantity: 0 });

    doc.moveTo(40, y + 10)
       .lineTo(550, y + 10)
       .stroke("#cc0000")
       .font("Helvetica-Bold")
       .text(`Total Products: ${products.length}`, 40, y + 20)
       .text(`Total Order Events: ${totals.events}`, 220, y + 20)
       .text(`Total Units Ordered: ${totals.quantity}`, 400, y + 20);

    // 8. Footer
    doc.fontSize(8)
       .fillColor("gray")
       .text("© 2025 Glimmer Inc. - All rights reserved", { 
         align: "center",
         width: 100,
         y: 600
       });

    doc.end();

  } catch (err) {
    console.error(`Report Error: ${err.message}`, err.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to generate report",
        details: err.message
      });
    }
  }
};

module.exports = { generateProductReport };