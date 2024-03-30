const express = require("express");
const userRouter = express.Router();

const {
  handleGetLogin,
  handleUserSignup,
  
} = require("../controllers/usercontroller");


userRouter.route("/")
          .get(handleGetLogin)
          .post(handleUserSignup); //its working as goood

        


module.exports = userRouter;
