const userDetails =require("../models/userDetails");
const WorkSession = require("../models/worksession");
var session = require('express-session');
const jwt = require("jsonwebtoken");
secret = "monad@9536";

function setUser(user){

    return jwt.sign({
        _id:user._id,
        email:user.email,
        
    },secret,{ expiresIn: '1h' });

}

function getUser(token){
  if(!token) return null;
  return jwt.verify(token,secret);
}



async function handleGetLogin(req,res){
    const { email, password } = req.body;
    try {
      const userCred = await userDetails.findOne({ email });

      if (!userCred) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (userCred.password !== password) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      
      const token =  setUser(userCred);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });

      res.status(200).json({msg:"login successful",isvalid:"true", data: userCred, status: true});

    } catch(error) {
      res.status(500).json({ message: "Internal server error" ,error, status: false});
    }
}




async function handleUserSignup(req,res){
    try {
        const userData = req.body.userData;
    
        // Create a new user document
        const newUser = new userDetails({
          fullName: userData.fullName,
          email: userData.email,
          password: userData.password,
        });
    
        // Save the new user to the database
        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User registered successfully',status: true});
        
      } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: error, status: false });

      }
}


// async function handleGetAttendancePreview(req,res){
//   try {
//       const listings = await WorkSession.find({});
//       if (listings.length === 0) {
//         // No listings found
//         return res.status(404).json({ message: "No listings found" });
//       }
//       res.json({ message: "Listings fetched successfully", listings: listings });
//     } catch (error) {
//       console.error("Error fetching listings:", error);
//       res.status(500).send("Error fetching listings");
//     }
// }



module.exports = {handleGetLogin,handleUserSignup,}