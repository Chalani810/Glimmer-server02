const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

const addProduct = async (req, res) => {
  try {
    const { pname, events, stock, pprice } = req.body;

    console.log(req.body);
    

    const photoUrl = req.file ? `app/uploads/${req.file.filename}` : "";

    if (!pname || !events || !pprice) {
      return res
        .status(400)
        .json({ message: "Product name, event IDs, and price are required" });
    }

    const eventIds = Array.isArray(events) 
      ? events 
      : events.split(',').map(id => id.trim());

    const newProduct = new Product({
      pname,
      events: eventIds,
      stockqut: stock,
      pprice,
      photoUrl,
      visibility: true,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate({
      path: 'events',
    });

    console.log(products);
    

    const productsWithFullPath = products.map((product) => {
      const cleanPath = product.photoUrl?.split("uploads/")[1] || "";
      return {
        ...product.toObject(),
        photoUrl: `${req.protocol}://${req.get("host")}/uploads/${cleanPath}`,
      };
    });

    res.status(200).json(productsWithFullPath);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve products", error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { pname, events, stock, pprice, visibility } = req.body;
    
    // Find the existing product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle events (convert to array if it's a string)
    const eventIds = Array.isArray(events) 
      ? events 
      : events.split(',').map(id => id.trim());

    // Update product fields
    product.pname = pname || product.pname;
    product.events = eventIds.length > 0 ? eventIds : product.events;
    product.stockqut = stock || product.stockqut;
    product.pprice = pprice || product.pprice;
    product.visibility = visibility !== undefined ? visibility : product.visibility;

    // Handle new image upload if provided
    if (req.file) {
      // Delete the old image if it exists
      if (product.photoUrl) {
        const oldPhotoPath = path.join(__dirname, "../..", product.photoUrl);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      // Set the new image path
      product.photoUrl = `app/uploads/${req.file.filename}`;
    }

    // Save the updated product
    const updatedProduct = await product.save();
    
    // Populate events for the response
    await updatedProduct.populate({
      path: 'events',
    });

    // Prepare the response with full photo URL
    const cleanPath = updatedProduct.photoUrl?.split("uploads/")[1] || "";
    const productWithFullPath = {
      ...updatedProduct.toObject(),
      photoUrl: `${req.protocol}://${req.get("host")}/uploads/${cleanPath}`,
    };

    res.status(200).json({ 
      message: "Product updated successfully", 
      product: productWithFullPath 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Failed to update product", 
      error: err.message 
    });
  }
};
const getProductsByEventId = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Find products where the events array contains the specified eventId
    const products = await Product.find({ events: eventId }).populate({
      path: 'events',
    });

    const productsWithFullPath = products.map((product) => {
      const cleanPath = product.photoUrl?.split("uploads/")[1] || "";
      return {
        ...product.toObject(),
        photoUrl: `${req.protocol}://${req.get("host")}/uploads/${cleanPath}`,
      };
    });

    res.status(200).json(productsWithFullPath);
  } catch (err) {
    res.status(500).json({ 
      message: "Failed to retrieve products by event ID", 
      error: err.message 
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.photoUrl) {
      const photoPath = path.join(__dirname, "../..", product.photoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: err.message });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteProduct,
  getProductsByEventId,
  updateProduct,
};
