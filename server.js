const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./app/routes/authRoutes");
const evenRoutes = require("./app/routes/evenRoutes");
const productRoutes = require("./app/routes/productRoutes");
const checkoutRoutes = require("./app/routes/checkoutRoutes");
const cartRoutes = require("./app/routes/cartRoutes");
const invoiceRoutes = require("./app/routes/invoiceRoutes"); 
const employeeRoutes = require("./app/routes/employeeRoutes");
const contactusRoutes = require("./app/routes/contactusRoutes");
const roleRoutes = require("./app/routes/roleRoutes");
const salaryRoutes = require("./app/routes/salaryRoutes");
const feedbackRoutes = require("./app/routes/feedbackRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/auth", authRoutes);
app.use("/event", evenRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/cart", cartRoutes);
app.use("/api", productRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/employee", employeeRoutes);
app.use("/contact", contactusRoutes);
app.use("/role", roleRoutes);
app.use("/salary", salaryRoutes);
app.use("/product", productRoutes);
app.use("/feedbacks", feedbackRoutes);
