const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const adminSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true, 
    },
    password: {
      type: String,
      required: true
     
    }
  });

//creating model for admin
const adminDetails = mongoose.model('adminDetails', adminSchema);

module.exports = adminDetails;