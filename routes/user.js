const express = require("express");
const userRouter = express.Router();

const {
  handleGetLogin,
  handleUserSignup,
  getUserProfile,
  
} = require("../controllers/usercontroller");


userRouter.route("/")
          .get(handleGetLogin)
          .post(handleUserSignup); 
          //its working as goood
userRouter.get("/get-user-details",getUserProfile)
        


module.exports = userRouter;
