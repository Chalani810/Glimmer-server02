const Checkout = require("../models/Checkout");
const path = require("path");	
const fs = require("fs");
const { log } = require("console");

const addCheckout = async (req, res) => {
  try {
    const {
      orderNumber,
      firstName,
      lastName,
      email,
      address,
      telephone,
      mobile,
      contactMethod,
      guestcount,
      comment,
      totalAmount,
      advancePayment,
    } = req.body;

    const slipUrl = req.file ? `app/uploads/${req.file.filename}` : '';

    const generateOrderCode = () => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const second = String(now.getSeconds()).padStart(2, '0');
    
      return `OID-${month}${day}${hour}${minute}${second}`;
    };

    log("Received file:", req.file); // Log the received file for debugging

    // Validation - check important fields
    if (!firstName || !lastName || !email || !totalAmount) {
      return res.status(400).json({ 
        message: "First Name, Last Name, Email, and Total Amount are required" 
      });
    }

    // Create a new checkout entry
    const newCheckout = new Checkout({
      orderId : generateOrderCode(),
      firstName,
      lastName,
      email,
      address,
      telephone,
      mobile,
      contactMethod,
      guestcount,
      comment,
      totalAmount,
      advancePayment,
      slipUrl,
    });

    await newCheckout.save();

    res.status(201).json({ message: "Checkout created successfully", data: newCheckout });
  } catch (err) {
    console.error("Error in addCheckout:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const checkouts = await Checkout.find();
    
    const checkoutsWithFullPath = checkouts.map(checkout => {
      const result = {
        ...checkout.toObject()
      };

      if (checkout.slipUrl) {
        try {
          const splitUrl = checkout.slipUrl.split('uploads/');
          if (splitUrl.length > 1) {
            result.slipUrl = `${req.protocol}://${req.get('host')}/uploads/${splitUrl[1]}`;
          } else {
            result.slipUrl = checkout.slipUrl;
          }
        } catch (error) {
          result.slipUrl = checkout.slipUrl;
        }
      }

      return result;
    });
    
    res.status(200).json(checkoutsWithFullPath);
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve checkouts", 
      error: err.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedOrder = await Checkout.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated", data: updatedOrder });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};


const deleteCheckout = async (req, res) => {
  try { 
 const {checkoutId} = req.params;

 log("Received checkoutId:", checkoutId); // Log the received checkoutId for debugging

 const checkout = await Checkout.findById(checkoutId);
if (!checkout) {
   return res.status(404).json({message: "Checkout not found"});

  }

  if(checkout.slipUrl) {
    const filePath = path.join(__dirname, "../..", checkout.slipUrl);

    //check if the file exists before attempting to delete it

    if(fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await Checkout.deleteOne(); //delete the checkout from the database

  res.status(200).json({message: "Checkout deleted successfully"});
} catch (err) {
  res.status(500).json({message: "Failed to delete checkout", error: err.message});
}
}; 

module.exports = {
  addCheckout,
  getAll,
  updateOrderStatus,
  deleteCheckout,
};