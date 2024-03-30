const mongoose = require("mongoose");

// Define the schema for expenses
const expenseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  local: {
    type: Number,
    required: true,
  },
  intercity: {
    type: Number,
    required: true,
  },
  lodging: {
    type: Number,
    required: true,
  },
  meal: {
    type: Number,
    required: true,
  },
  others: {
    type: Number,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  // You can add more fields as per your application's requirements
});

// Create a model using the schema
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
