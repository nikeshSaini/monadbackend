require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer"); // Add multer for file upload handling
var session = require('express-session')
const app = express();
const adminRoute = require("./routes/admin.js");
const userRouter = require("./routes/user.js");
const { mongodbConnection, } = require("./connection.js");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const WorkSession = require('./models/worksession.js')
const userDetails = require("./models/userDetails.js")
const Expense = require("./models/expenseform.js");


const port = process.env.PORT;
//model import

//middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: true
}));

// Configure multer for file upload handling
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => { // Corrected the callback arguments
    cb(null, file.originalname); // Use the original filename
  }
});

let upload = multer({
  storage: storage
});

//database connection

mongodbConnection(process.env.MONGO_URL);


//admin routes
app.use("/api/admin", adminRoute);
app.use("/api/users", userRouter);


//expense route
app.post("/api/users/expenseform", upload.single('img'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    const token = req.body.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.user._id;
    console.log(userId);
    const feedbackData = req.body.expense;
    const img = req.file.filename;
    const feedbackItem = new Expense({
      userId: userId,
      description: feedbackData.description,
      location: feedbackData.location,
      local: feedbackData.local,
      intercity: feedbackData.intercity,
      lodging: feedbackData.lodging,
      meal: feedbackData.meal,
      others: feedbackData.others,
      img: img,
    });
    console.log({
      description: feedbackData.description,
      location: feedbackData.location,
      local: feedbackData.local,
      intercity: feedbackData.intercity,
      lodging: feedbackData.lodging,
      meal: feedbackData.meal,
      others: feedbackData.others,
      img: img,
    });
    await feedbackItem.save();

    res.status(201).json({ msg: "Expenses saved successfully", status: true });
  } catch (error) {
    console.error("Error saving Expense form:", error);
    res.status(500).json({ error: `Error saving ExpenseForm: ${error.message}`, status: false });

  }
});


//post data after submiting the form

app.post('/api/users/start', async (req, res) => {
  try {
    // Create a new work session document with the starting time and location
    const token = req.body.token;
    console.log("start", token);
    let userId;

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      userId = decodedToken.user._id;
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(403).json({ message: 'Invalid or expired token.', status: false });
    }

    const latitude = req.body.latitude;
    const longitude = req.body.longitude;

    console.log(latitude, longitude);
    if (!userId || isNaN(latitude) || isNaN(longitude)) {
      // Respond with a bad request status if required data is missing or invalid
      return res.status(400).json({ message: 'Missing or invalid required fields.' });
    }

    const newWorkSession = new WorkSession({
      userId: userId,
      startTime: new Date(),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // Note: longitude first, then latitude
      }
    });

    // Save the document to the database
    await newWorkSession.save();

    res.status(200).json({ message: 'Starting time recorded successfully.', status: true });
    console.log(202, "created")
  } catch (error) {
    console.error('Error recording starting time:', error);
    res.status(500).json({ message: 'Error recording starting time.', status: false });
  }
});


app.post('/api/users/end', async (req, res) => {
  try {
    // Verify token and extract user ID
    const token = req.body.token;
    console.log('end', token)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.user._id;

    // Find the latest work session for the current user
    const latestSession = await WorkSession.findOne({ userId }).sort({ startTime: -1 });

    if (!latestSession) {
      return res.status(404).json({ message: 'No active work session found for the current user.' });
    }

    // Update the ending time of the latest session to the current time
    latestSession.endTime = new Date();

    // Save the changes to the session
    await latestSession.save();

    // Return a success response
    return res.status(200).json({ message: 'Ending time recorded successfully.', status: true });

  } catch (error) {
    // Handle errors that may occur during the process
    console.error('Error recording ending time:', error);
    return res.status(500).json({ message: 'Error recording ending time.', status: false });
  }
});






//attendance page route for user
app.post('/api/users/view/attendance', async (req, res) => {
  try {
    // Verify token and extract user ID
    const token = req.body.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.user._id;
    console.log(userId);
    console.log(token);

    // Return error if no user ID found
    if (!userId) {
      return res.json({ status: false, msg: "No user found." });
    }

    // Retrieve attendance records for the authenticated user
    const attendanceRecords = await WorkSession.find({ userId }).sort({ startTime: 1 });

    // Return the attendance records in the response
    return res.json({ attendanceRecords, status: true });
  } catch (error) {
    // Handle errors that may occur during the process
    console.error("Error fetching attendance:", error);
    return res.status(500).json({ status: false, msg: "Failed to fetch attendance records." });
  }
});

//feedback view for user
app.get('/api/users/view/expenseForm', async (req, res) => {
  try {
    // Verify token and extract user ID
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;

    // If no user ID found, return an error message
    if (!userId) {
      return res.json({ msg: 'Please login to view feedback', status: false });
    }

    // Here, you'd query feedback data from your database based on the user ID
    // For demonstration, let's assume you have a Feedback model and you query the data
    // Replace the following line with your actual data retrieval logic
    const ExpenseData = await Expense.find({ userId });

    // Respond with the feedback data
    return res.json({ data: ExpenseData, status: true });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error while accessing feedback:", error);
    // Respond with a generic server error message
    return res.status(500).json({ msg: "An error occurred while retrieving feedback", status: false });
  }
});





app.get("/api/users/logout", (req, res) => {
  // Clear the JWT token by removing it from the client-side
  res.clearCookie("token"); // Clear the token cookie

  // Clear any other cookies if needed
  // res.clearCookie("cookieName");

  // Clear any server-side session or state associated with the user

  // Redirect the user to the login page after logout
  res.redirect("/");
});













//for admin to fetch list of users
app.get("/api/admin/view/userslist", async (req, res) => {
  try {
    // Fetch user details from the database
    const userList = await userDetails.find({});

    // Check if any users were found
    if (!userList || userList.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    // Send the user list data as JSON
    res.status(200).json({ userList, status: true });
  } catch (error) {
    // Handle errors
    console.error("Error fetching user list:", error);
    res.status(500).json({ error: "Error fetching user list", status: false });
  }
});










//feedback via admin
app.post('/api/admin/view/expenseForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const user = await userDetails.findById(id);
    console.log(user); // Assuming userDetails is your user model
    if (!user) {
      // If no user is found with the provided ID
      return res.status(404).json({ message: "User not found", status: false });
    }
    const currUserName = user.fullName;
    const feedbacks = await Expense.find({ userId: id });

    // Check if feedback exists
    if (feedbacks.length === 0) {
      return res.status(404).json({ message: "No expenses found for the user", status: false });
    }

    res.status(200).json({ feedbacks, currUserName, status: true });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Error fetching expneses", status: false });
  }
});


//attendance via admin
app.get('/api/admin/view/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userDetails.findById(id); // Assuming userDetails is your user model

    if (!user) {
      // If no user is found with the provided ID
      return res.status(404).json({ message: "User not found", status: false });
    }

    const currUserName = user.fullName;
    const worksession = await WorkSession.find({ userId: id }); // Assuming userId field is used to identify the user in the WorkSession model

    res.json({ worksession, currUserName, status: true });
  } catch (error) {
    console.error("Error fetching work session:", error);
    res.status(500).json({ message: "Error fetching work session", status: false });
  }
});








// app.get('/location',(req,res)=>{
//   res.render('getcurrent.ejs'); 
// })
app.listen(port, (req, res) => {
  console.log("app is listening" + port);
});