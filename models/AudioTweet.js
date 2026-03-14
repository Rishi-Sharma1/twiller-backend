import mongoose from "mongoose";

const audioTweetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  audioUrl: {
    type: String,
    required: true
  },

  duration: {
    type: Number,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("AudioTweet", audioTweetSchema);