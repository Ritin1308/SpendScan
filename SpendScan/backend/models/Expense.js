const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  merchant: String,
  date: Date,
  total: Number,
});

module.exports = mongoose.model("Expense", expenseSchema);
