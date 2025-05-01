const Checkout = require("../models/Checkout");
const path = require("path");	
const fs = require("fs");

const addCheckout = async (req, res) => {
  try {
    console.log("Received files:", req.file); // Check if file is received
    console.log("Received body:", req.body); // Check what's in the body

    // Extract all fields from req.body
    const {
      orderNumber,
      firstName,
      lastName,
      email,
      address,
      telephone,
      mobile,
      contactMethod,
      comment,
      totalAmount,
      advancePayment,
    } = req.body;

    // Check if the file was uploaded
    const slipUrl = req.file ? `app/uploads/${req.file.filename}` : '';

    // Validation - check important fields
    if (!firstName || !lastName || !email || !totalAmount) {
      return res.status(400).json({ 
        message: "First Name, Last Name, Email, and Total Amount are required" 
      });
    }

    // Create a new checkout entry
    const newCheckout = new Checkout({
      orderNumber,
      firstName,
      lastName,
      email,
      address,
      telephone,
      mobile,
      contactMethod,
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

module.exports = {
  addCheckout,
};

const getAll = async (req, res) => {
  try {
    const checkouts = await Checkout.find();
    
    const checkoutsWithFullPath = checkouts.map(checkout => {
      return {
        ...checkout.toObject(),
        slipUrl: `${req.protocol}://${req.get('host')}/uploads/${
          checkouts.slipUrl.split('uploads/')[1]
        }`
       }; // Full URL for the slipUrl
      });
    res.status(200).json(checkoutsWithFullPath);
  } catch (err) {
    res .status(500)
    .jason({message: "Failed to retrieve checkouts", error: err.message});
  }
};


const deleteCheckout = async (req, res) => {
  try { 
 const {checkoutId} = req.params;

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
  deleteCheckout,
};