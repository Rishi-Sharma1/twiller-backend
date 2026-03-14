import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  plan: {
    type: String,
    enum: ["FREE", "BRONZE", "SILVER", "GOLD"],
    default: "FREE"
  },

  tweetLimit: Number,

  startDate: Date,
  endDate: Date,

  paymentId: String
});

export default mongoose.model("Subscription", subscriptionSchema);
