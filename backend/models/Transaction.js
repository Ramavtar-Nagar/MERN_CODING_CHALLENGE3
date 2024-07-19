const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  productId: String,
  title: String,
  price: Number,
  description: String,
  category: String,
  dateOfSale: Date,
  sold: Boolean,
});

module.exports = mongoose.model('Transaction', transactionSchema);