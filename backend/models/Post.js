const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  image: {
  type: String,
  default: ""
},
  likes: {
  type: [String], // store userIds
  default: [],
},
comments: [
  {
    userId: String,
    username: String,
    text: String,

    replies: [
      {
        userId: String,
        username: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);