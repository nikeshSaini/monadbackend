const express = require("express");
const userRouter = express.Router();
const verifyToken = require("../middleware/auth")
const {
  handleGetLogin,
  handleUserSignup,
  getUserProfile,

} = require("../controllers/usercontroller");


userRouter.post("/login", handleGetLogin)
userRouter.post("/signup", handleUserSignup)

//its working as goood
userRouter.get("/get-user-details", verifyToken, getUserProfile)



module.exports = userRouter;
