const express = require("express");

const router = express.Router();

const User = require("../models/User");

const authMiddleware =
  require("../middleware/auth");


// ================= GET ALL USERS =================

router.get("/", async (req, res) => {

  try {

    const users = await User.find()
      .select("-password");

    res.status(200).json(users);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ================= FOLLOW / UNFOLLOW =================

router.put(
  "/:id/follow",
  authMiddleware,

  async (req, res) => {

    try {

      const userToFollow =
        await User.findById(req.params.id);

      const currentUser =
        await User.findById(req.user.id);


      // CHECK USER EXISTS
      if (!userToFollow) {

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


      // ================= UNFOLLOW =================

      if (

        currentUser.following.includes(
          req.params.id
        )

      ) {

        currentUser.following =
          currentUser.following.filter(

            id => id !== req.params.id

          );

        userToFollow.followers =
          userToFollow.followers.filter(

            id => id !== req.user.id

          );

        await currentUser.save();

        await userToFollow.save();

        return res.json({

          message: "Unfollowed 💔",

          following:
            currentUser.following,

          followers:
            userToFollow.followers

        });

      }


      // ================= FOLLOW =================

      currentUser.following.push(
        req.params.id
      );

      userToFollow.followers.push(
        req.user.id
      );

      await currentUser.save();

      await userToFollow.save();

      res.json({

        message: "Followed ❤️",

        following:
          currentUser.following,

        followers:
          userToFollow.followers

      });

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }

);


// ================= GET SINGLE USER =================

router.get("/:id", async (req, res) => {

  try {

    const user =
      await User.findById(req.params.id)
        .select("-password");

    if (!user) {

      return res.status(404).json({

        message: "User not found ❌"

      });

    }

    res.json(user);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


module.exports = router;