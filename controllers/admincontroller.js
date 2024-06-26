const adminDetails =require("../models/adminDetails");
const jwt = require('jsonwebtoken')
async function handleGetAdminLogin(req,res){
    const { email, password } = req.body;
    try {
      const adminCred = await adminDetails.findOne({ email });
  
      if (!adminCred || adminCred.password !== password) {
        return res.status(404).json({ message: "Credentials not found" });
      }
      jwt.sign({ user: adminCred }, process.env.JWT_SECRET_KEY, (err, token) => {
        return res.status(200).json({message:"Successful Login",token:token});
    });
      

    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
}

module.exports ={handleGetAdminLogin,}