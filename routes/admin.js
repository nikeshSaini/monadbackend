const express = require('express');
const adminRoute =express.Router();

const {handleGetAdminLogin} = require("../controllers/admincontroller");


adminRoute.route("/")
    .get(handleGetAdminLogin)
    // .post(handlePostAdminLogin)

module.exports = adminRoute;