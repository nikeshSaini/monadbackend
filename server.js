require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer"); // Add multer for file upload handling
var session = require('express-session')
const app = express();
const adminRoute =require("./routes/admin.js");
const userRouter = require("./routes/user.js");
const {mongodbConnection,} = require("./connection.js");
const port = process.env.PORT ;
//model import
const Expense = require("./models/expenseform.js");

//middlewares
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
app.use("/api/admin",adminRoute);
app.use("/api/users",userRouter);


//expense route
app.post("/api/users/expenseform", upload.single('img'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    const feedbackData = req.body.expense;
    const img = req.file.filename;
    const feedbackItem = new Expense({
        userId: feedbackData.userId,
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
    res.status(500).json({ error: `Error saving ExpenseForm: ${error.message}`, status: true });

  }
});


 //post data after submiting the form
  
 app.post('/api/users/start', async (req, res) => {
  try {
    // Create a new work session document with the starting time and location
    const sessionData = req.body.session;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;

    if (!sessionData.userId || isNaN(latitude) || isNaN(longitude)) {
      // Respond with a bad request status if required data is missing or invalid
      return res.status(400).json({ message: 'Missing or invalid required fields.' });
    }

    const newWorkSession = new WorkSession({
      userId: sessionData.userId,
      startTime: new Date(),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // Note: longitude first, then latitude
      }
    });

    // Save the document to the database
    await newWorkSession.save();
    
    res.status(202).json({ message: 'Starting time recorded successfully.',status: true });
  } catch (error) {
    console.error('Error recording starting time:', error);
    res.status(500).json({ message: 'Error recording starting time.',status: false });
  }
});


app.post('/api/users/end', async (req, res) => {
  try {
    // Find the latest work session and update its ending time
    const sessionData =req.body.session;
    const latestSession = await WorkSession.findOne().sort({startTime: -1});

    if (!latestSession) {
      return res.status(404).json({ message: 'No active work session found.' });
    }

    latestSession.endTime = new Date();

    await latestSession.save();
    res.json({ message: 'Ending time recorded successfully.' ,status: true});

  } catch (error) {
    console.error('Error recording ending time:', error);
    res.status(500).json({ message: 'Error recording ending time.' ,status: false});
  }
});


  
 
  
  //attendance page route for user
  app.get('/api/users/view/attendance', async (req, res) => {
    const userCred = req.session.userCred; // Retrieving userCred from session
    if (!userCred) {
        return res.json({ status: false, msg: "No user Found" }); // Return error if not authenticated
    }
    
    try {
        const currId = userCred._id;
        const worksession = await WorkSession.find({ userId: currId }).sort({ startTime: 1 });
        res.json({ worksession, status: true });
    } catch (error) {
        console.error("Error fetching attendance:", error); // Log the error for server-side inspection
        res.status(500).json({ status: false, msg: "Failed to fetch attendance records" });
    }
});

 //feedback view for user
 app.get('/api/users/view/feedback', (req, res) => {
  try {
      const userCred = req.session.userCred; // Retrieving userCred from session
      if (!userCred) {
          // Instead of redirecting, respond with an error message in JSON format
          return res.json({ msg: 'Please login to view feedback', status: false });
      }

      // If the user is authenticated, proceed to send the feedback data
      // For demonstration, sending back userCred, in a real scenario, you'd query feedback data
      res.json({ data: userCred, status: true });
  } catch (error) {
      // Log the error for debugging purposes
      console.error("Error while accessing feedback:", error);
      // Respond with a generic server error message
      res.status(500).json({ msg: "An error occurred while retrieving feedback", status: false });
  }
});




app.get("/api/users/logout", (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Error destroying session");
    } else {
      // Redirect the user to the login page after logout
      res.redirect("/login");
    }
  });
});

  









//for admin to fetch list of users
  app.get("/api/admin/view/userslist", async (req, res) => {
    try {
        // Fetch user details from the database
        const userList = await UserDetails.find({});
        
        // Check if any users were found
        if (!userList || userList.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }
        
        // Send the user list data as JSON
        res.status(200).json({ userList , status: true});
    } catch (error) {
        // Handle errors
        console.error("Error fetching user list:", error);
        res.status(500).json({ error: "Error fetching user list",status: false });
    }
});




  
  
 

  
 
  //feedback via admin
  app.get('/api/admin/view/feedback/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userDetails.findById(id); // Assuming userDetails is your user model
      if (!user) {
        // If no user is found with the provided ID
        return res.status(404).json({ message: "User not found", status: false });
      }
      const currUserName = user.fullName;
      const feedbacks = await Expense.find({ userId: id });
  
      // Check if feedback exists
      if (feedbacks.length === 0) {
        return res.status(404).json({ message: "No feedback found for the user", status: false });
      }
  
      res.json({ feedbacks, currUserName, status: true });
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Error fetching feedback", status: false });
    }
  });
  
  
  //attendance via admin
  app.get('api/admin/view/attendance/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userDetails.findById(id); // Assuming userDetails is your user model
      const currUserName = user.fullName;
  
      const worksession = await WorkSession.find({ userId: id }); // Assuming userId field is used to identify the user in the WorkSession model
  
      res.json({ worksession, currUserName , status: true});
    } catch (error) {
      console.error("Error fetching work session:", error);
      res.status(500).json({msg:"Error fetching work session", status: false});
    }
  });
  
 
  
  
  

  
  // app.get('/location',(req,res)=>{
  //   res.render('getcurrent.ejs'); 
  // })
  app.listen(port, (req, res)=>{
      console.log("app is listening" + port);
  });
  
  