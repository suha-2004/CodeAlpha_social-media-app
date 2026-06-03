const express = require("express");
const router = express.Router();

const multer = require("multer");

const Post = require("../models/Post");
const User = require("../models/User");

const authMiddleware = require("../middleware/auth");


// ================= MULTER STORAGE =================

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }

});

const upload = multer({ storage });


// ================= CREATE POST =================

router.post(
  "/",
  authMiddleware,
  upload.single("image"),

  async (req, res) => {

    try {

      const { text } = req.body;

      // FIND USER
      const user = await User.findById(req.user.id);

      // IMAGE FILE
      const image = req.file
        ? req.file.filename
        : "";

      // CREATE POST
      const newPost = new Post({

        userId: user._id,

        username: user.username,

        text,

        image,

        likes: [],

        comments: []

      });

      await newPost.save();

      res.status(201).json({

        message: "Post created ✅",

        post: newPost

      });

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);


// ================= GET ALL POSTS =================

router.get("/", async (req, res) => {

  try {

    const posts = await Post.find()
      .sort({ createdAt: -1 });

    res.status(200).json({

      message: "Posts fetched ✅",

      posts

    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ================= LIKE / UNLIKE =================

router.put("/:id/like", authMiddleware, async (req, res) => {

  try {

    const post = await Post.findById(req.params.id);

    if (!post) {

      return res.status(404).json({
        message: "Post not found ❌"
      });

    }

    // ALREADY LIKED
    if (post.likes.includes(req.user.id)) {

      post.likes = post.likes.filter(
        (userId) => userId !== req.user.id
      );

      await post.save();

      return res.json({

        message: "Post unliked 💔",

        likes: post.likes.length

      });

    }

    // LIKE POST
    post.likes.push(req.user.id);

    await post.save();

    res.json({

      message: "Post liked ❤️",

      likes: post.likes.length

    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ================= COMMENT POST =================

router.post(
  "/:id/comment",
  authMiddleware,

  async (req, res) => {

    try {

      const { text } = req.body;

      const post = await Post.findById(req.params.id);

      const user = await User.findById(req.user.id);

      if (!post) {

        return res.status(404).json({
          message: "Post not found ❌"
        });

      }

      // CREATE COMMENT
      const newComment = {

        userId: user._id,

        username: user.username,

        text

      };

      post.comments.push(newComment);

      await post.save();

      res.json({

        message: "Comment added 💬",

        comments: post.comments

      });

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);
// ================= REPLY TO COMMENT =================

router.post(
  "/:postId/reply/:commentId",
  authMiddleware,
  async (req, res) => {

    try {

      const { text } = req.body;

      const post = await Post.findById(
        req.params.postId
      );

      const user = await User.findById(
        req.user.id
      );

      if (!post) {

        return res.status(404).json({
          message: "Post not found"
        });

      }

      const comment = post.comments.id(
        req.params.commentId
      );

      if (!comment) {

        return res.status(404).json({
          message: "Comment not found"
        });

      }

      comment.replies.push({

        userId: user._id,

        username: user.username,

        text

      });

      await post.save();

      res.json({
        message: "Reply added successfully"
      });

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);

module.exports = router;