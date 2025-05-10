const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

const addProduct = async (req, res) => {
  try {
    console.log(req.file);

    const { pname, ename, stockqut, pprice, visibility } = req.body;

    // ✅ Fix template literal usage
    const photoUrl = req.file ? `app/uploads/${req.file.filename}` : "";

    // Validation
    if (!pname || !ename || !pprice) {
      return res
        .status(400)
        .json({ message: "Product name, event name, and price are required" });
    }

    const newProduct = new Product({
      pname,
      ename,

      stockqut,

      stockqut: stock,

      pprice,
      photoUrl,
      visibility,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

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
};
