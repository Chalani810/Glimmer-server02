const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  pname: { type: String, required: true },              // Product name
  photoUrl: { type: String, default: '' },              // Image URL
  ename: { type: [String], required: true },              // Event name
  stockqut: { type: Number },               // Stock quantity
  pprice: { type: Number, required: true },             // Product price
  visibility: { type: Boolean, default: true },        // Visibility toggle
}, { timestamps: true });
module.exports = mongoose.model('Product', ProductSchema);