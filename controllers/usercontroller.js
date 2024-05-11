const userDetails = require("../models/userDetails");
const Expense = require('../models/expenseform')
const WorkSession = require("../models/worksession");
var session = require('express-session');
const jwt = require('jsonwebtoken')
function setUser(user) {

  return jwt.sign({
    userId: user._id,
    email: user.email,

  }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

}

function getUser(token) {
  if (!token) return null;
  return jwt.verify(token, secret);
}



async function handleGetLogin(req, res) {
  const { email, password } = req.body;
  try {
    const userCred = await userDetails.findOne({ email });

    if (!userCred) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userCred.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }


    const token = setUser(userCred);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
    jwt.sign({ user: userCred }, process.env.JWT_SECRET_KEY, (err, token) => {
      return res.status(200).json({ msg: "login successful", isvalid: "true", token: token, data: userCred, status: true });
    });


  } catch (error) {
    res.status(500).json({ message: "Internal server error", error, status: false });
  }
}




async function handleUserSignup(req, res) {
  try {
    const userData = req.body;

    // Create a new user document
    const newUser = await new userDetails({
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();
    jwt.sign({ user: newUser }, process.env.JWT_SECRET_KEY, (err, token) => {
      return res.status(201).json({ message: 'User registered successfully', token: token, status: true });
    });


  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error, status: false });

  }
}


async function handleGetAttendancePreview(req,res){
  try {
      const listings = await WorkSession.find({});
      if (listings.length === 0) {
        // No listings found
        return res.status(404).json({ message: "No listings found" });
      }
      res.json({ message: "Listings fetched successfully", listings: listings });
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).send("Error fetching listings");
    }
}

const getUserProfile = async (req, res) => {
  const userId = req.params.userId
  const theUser = await userDetails.findById(userId).lean()
  if (!theUser) {
    res.status(400).json({ status: false, message: "user not found" })
  } else {
    const theExp = await Expense.find({ userId: userId })
    theUser.userExpence = theExp
    // console.log(theExp)
    res.status(200).json({ status: true, message: "data returned", data: theUser })
  }
}

module.exports = { handleGetLogin, handleUserSignup, getUserProfile }