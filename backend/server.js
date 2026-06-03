const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

require("dotenv").config();

const app = express();


// ================= MIDDLEWARE =================

app.use(cors());

app.use(express.json());


// ================= STATIC FOLDER =================

// image access
app.use(
  "/uploads",
  express.static("uploads")
);


// ================= IMPORT ROUTES =================

const authRoutes =
  require("./routes/auth");

const postRoutes =
  require("./routes/post");

const userRoutes =
  require("./routes/user");


// ================= IMPORT MIDDLEWARE =================

const authMiddleware =
  require("./middleware/auth");


// ================= USE ROUTES =================

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/users", userRoutes);


// ================= DATABASE CONNECTION =================

mongoose.connect(

  "mongodb+srv://suha:suha%402004@cluster0.yco9g8p.mongodb.net/socialmedia?retryWrites=true&w=majority"

)

.then(() => {

  console.log("MongoDB Connected ✅");

})

.catch((err) => {

  console.log(
    "MongoDB Error ❌",
    err
  );

});


// ================= TEST ROUTE =================

app.get("/", (req, res) => {

  res.send("Backend is running 🚀");

});


// ================= PROTECTED ROUTE =================

app.get(

  "/api/protected",

  authMiddleware,

  (req, res) => {

    res.json({

      message: "You are allowed 🔓",

      user: req.user

    });

  }

);


// ================= START SERVER =================

const PORT = 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});