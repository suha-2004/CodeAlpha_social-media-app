const express = require("express");
const router = express.Router();

const User = require("../models/User");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");


// ================= REGISTER =================

router.post("/register", async (req, res) => {

  try {

    const { username, email, password } = req.body;

    // CHECK EMPTY FIELDS
    if (!username || !email || !password) {

      return res.status(400).json({
        message: "All fields are required ❌"
      });

    }

    // CHECK EMAIL EXISTS
    const existingEmail =
      await User.findOne({ email });

    if (existingEmail) {

      return res.status(400).json({
        message: "Email already registered ❌"
      });

    }

    // CHECK USERNAME EXISTS
    const existingUsername =
      await User.findOne({ username });

    if (existingUsername) {

      return res.status(400).json({
        message: "Username already taken ❌"
      });

    }

    // HASH PASSWORD
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // CREATE USER
    const newUser = new User({

      username,

      email,

      password: hashedPassword,

      followers: [],

      following: []

    });

    // SAVE USER
    await newUser.save();

    res.status(201).json({

      message:
        "User registered successfully ✅"

    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ================= LOGIN =================

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // CHECK EMPTY FIELDS
    if (!email || !password) {

      return res.status(400).json({
        message:
          "Email and password required ❌"
      });

    }

    // FIND USER
    const user =
      await User.findOne({ email });

    // USER NOT FOUND
    if (!user) {

      return res.status(400).json({
        message: "User not found ❌"
      });

    }

    // CHECK PASSWORD
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    // WRONG PASSWORD
    if (!isMatch) {

      return res.status(400).json({
        message: "Wrong password ❌"
      });

    }

    // CREATE JWT TOKEN
    const token = jwt.sign(

      {
        id: user._id,
        username: user.username
      },

      "secretkey123",

      {
        expiresIn: "1h"
      }

    );

    // SUCCESS RESPONSE
    res.status(200).json({

      message: "Login successful 🚀",

      token,

      user: {

        id: user._id,

        username: user.username,

        email: user.email,

        followers: user.followers,

        following: user.following

      }

    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ================= FOLLOW / UNFOLLOW =================

router.put("/follow/:id", async (req, res) => {

  try {

    const currentUserId =
      req.body.currentUserId;

    const userToFollow =
      await User.findById(req.params.id);

    const currentUser =
      await User.findById(currentUserId);

    // CHECK USERS
    if (!userToFollow || !currentUser) {

      return res.status(404).json({
        message: "User not found ❌"
      });

    }

    // CANNOT FOLLOW SELF
    if (
      currentUser._id.toString() ===
      userToFollow._id.toString()
    ) {

      return res.status(400).json({
        message:
          "You cannot follow yourself ❌"
      });

    }

    // ALREADY FOLLOWING
    if (

      currentUser.following.includes(
        userToFollow._id.toString()
      )

    ) {

      // UNFOLLOW
      currentUser.following =
        currentUser.following.filter(

          id =>
            id !==
            userToFollow._id.toString()

        );

      userToFollow.followers =
        userToFollow.followers.filter(

          id =>
            id !==
            currentUser._id.toString()

        );

      await currentUser.save();

      await userToFollow.save();

      return res.json({

        message: "User unfollowed 💔"

      });

    }

    // FOLLOW
    currentUser.following.push(
      userToFollow._id.toString()
    );

    userToFollow.followers.push(
      currentUser._id.toString()
    );

    await currentUser.save();

    await userToFollow.save();

    res.json({

      message: "User followed ❤️"

    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


module.exports = router;