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

    res.status(201).json({ message: "Expenses saved successfully", feedbackItem });
  } catch (error) {
    console.error("Error saving Expense form:", error);
    res.status(500).send("Error saving ExpenseForm: " + error.message);
  }
});

  
 
  
  
  
 
  
  // app.get("/userPreview", async (req, res) => {
  //   try {
  //     // Fetch all user details from the database
  //     const users = await userDetails.find({});
  
  //     // Check if users exist
  //     if (users.length === 0) {
  //       // Optionally, render a specific view if no users are found,
  //       // or pass a message to the same view indicating no users were found.
  //       // This depends on your application's design and user experience strategy.
  //       return res.render("userPreview", { message: "No users found" });
  //     }
  
  //     // Render the 'userPreview' view, passing the list of users
  //     res.render("userPreview", { listings: users });
  //   } catch (error) {
  //     console.error("Error fetching user details:", error);
  //     // Render an error view or pass an error message to an existing view.
  //     // Adjust the implementation based on how you want to handle and display errors.
  //     res.status(500).render("errorView", { error: "Error fetching user details" });
  //   }
  // });
  
  
  // //post data after submiting the form
  
  // app.post('/start', async (req, res) => {
  //   try {
  //     // Create a new work session document with the starting time and location
  //     const sessionData = req.body.session;
  //     const latitude = req.body.latitude;
  //     const longitude = req.body.longitude;

  //     if (!sessionData.userId || isNaN(latitude) || isNaN(longitude)) {
  //       // Respond with a bad request status if required data is missing or invalid
  //       return res.status(400).json({ message: 'Missing or invalid required fields.' });
  //     }
  
  //     const newWorkSession = new WorkSession({
  //       userId: sessionData.userId,
  //       startTime: new Date(),
  //       location: {
  //         type: 'Point',
  //         coordinates: [longitude, latitude] // Note: longitude first, then latitude
  //       }
  //     });
  
  //     // Save the document to the database
  //     await newWorkSession.save();
      
  //     res.json({ message: 'Starting time recorded successfully.' });
  //   } catch (error) {
  //     console.error('Error recording starting time:', error);
  //     res.status(500).json({ message: 'Error recording starting time.' });
  //   }
  // });
  

  // app.post('/end', async (req, res) => {
  //   try {
  //     // Find the latest work session and update its ending time
  //     const sessionData =req.body.session;

  //     const latestSession = await WorkSession.findOne().sort({startTime: -1});

  //     if (!latestSession) {
  //       return res.status(404).json({ message: 'No active work session found.' });
  //     }

  //     latestSession.endTime = new Date();

  //     await latestSession.save();
  //     res.json({ message: 'Ending time recorded successfully.' });

  //   } catch (error) {
  //     console.error('Error recording ending time:', error);
  //     res.status(500).json({ message: 'Error recording ending time.' });
  //   }
  // });
  

  

  app.get("/userlist", async (req, res) => {
    try {
        // Fetch user details from the database
        const userList = await UserDetails.find({});
        
        // Check if any users were found
        if (!userList || userList.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }
        
        // Send the user list data as JSON
        res.status(200).json({ userList });
    } catch (error) {
        // Handle errors
        console.error("Error fetching user list:", error);
        res.status(500).json({ error: "Error fetching user list" });
    }
});



  

  
  
  
  
  
  
  
  
  //login credential post route
  app.post("/login", async(req,res)=>{
    
  });
  
  
  
  
  // Logout route
  app.get("/logout", (req, res) => {
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
  
  
  // Default route
  app.get('/', (req, res) => {
    // Check if user is logged in (userCred exists in session)
    if (req.session.userCred) {
      // User is logged in, render the landing page
      res.render("landingPage.ejs", { userCred: req.session.userCred });
    } else {
      // User is not logged in, render the login page
      res.render("login.ejs");
    }
  });
  
  
  //login route
  
  app.get("/login" ,(req, res)=>{
    res.render("login.ejs");
  })
  
  
  //login user landing page
  app.get('/user', (req, res) => {
    const userCred = req.session.userCred; // Retrieving userCred from session
    if (!userCred) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render("landingPage.ejs", { userCred });
  });
  //admin login
  
  app.get("/adminlogin",(req,res)=>{
    res.render("adminLogin.ejs");
  })
  // /register
  app.get("/register", (req,res)=>{
    res.render("userForm.ejs");
  });
  
  
  
  //feedback
  
  app.get('/feedback', (req, res) => {
    const userCred = req.session.userCred; // Retrieving userCred from session
    if (!userCred) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('index', { userCred });
  });
  
  //preview feedback
  app.get('/view/feedback', async(req,res)=>{
    const userCred = req.session.userCred; // Retrieving userCred from session
    if (!userCred) {
      return res.redirect('/login'); // Redirect to login if not authenticated
    }
    const currId =userCred._id;
    const currUserName = userCred.fullName;
    const feedbacks = await Listing.find({userId : currId});
    res.render("showFeedback.ejs",{feedbacks,currUserName});
  }); 
  //feedback via admin
  app.get('/view/feedback/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userDetails.findById(id); // Assuming userDetails is your user model
      const currUserName = user.fullName;
      const feedbacks = await Listing.find({ userId: id }); 
      res.render("showFeedback", { feedbacks, currUserName });
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).send("Error fetching feedback");
    }
  });
  
  //attendance via admin
  app.get('/view/attendance/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userDetails.findById(id); // Assuming userDetails is your user model
      const currUserName = user.fullName;
  
      const worksession = await WorkSession.find({ userId: id }); // Assuming userId field is used to identify the user in the WorkSession model
  
      res.render("adminpreview", { worksession, currUserName });
    } catch (error) {
      console.error("Error fetching work session:", error);
      res.status(500).send("Error fetching work session");
    }
  });
  
  
  
  //attendance page route
  app.get('/view/attendance', async(req,res)=>{
    const userCred = req.session.userCred; // Retrieving userCred from session
    if (!userCred) {
      return res.redirect('/login'); // Redirect to login if not authenticated
    }
    const currId =userCred._id;
    const worksession = await WorkSession.find({ userId: currId }).sort({ startTime: 1 });
    res.render("preview.ejs",{worksession});
  }); 
  
  app.get('/attendance',(req,res)=>{
    const userCred = req.session.userCred;// Retrieving userCred from session
    res.render('showattendance.ejs',{userCred});
  })
  
  // app.get('/location',(req,res)=>{
  //   res.render('getcurrent.ejs');
  // })
  app.listen(port, (req, res)=>{
      console.log("app is listening" + port);
  });
  
  