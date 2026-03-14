import express from "express";
import {getRazorpay} from "../config/razorpay.js";
import { plans } from "../config/plans.js";
import Subscription from "../models/Subscription.js";
import { paymentTimeCheck } from "../middlewares/paymentTime.js";
import { sendInvoice } from "../utils/sendInvoice.js";
import User from "../models/user.js";

const router = express.Router();

/* Create Order */
router.post("/create-order", paymentTimeCheck, async (req, res) => {

  try {

    const { plan, userId } = req.body;

    if (!plan || !userId) {
      return res.status(400).json({
        message: "Missing plan or user"
      });
    }

    if (!plans[plan]) {
      return res.status(400).json({
        message: "Invalid plan"
      });
    }

    const amount = plans[plan].price * 100;

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    res.json(order);

  } catch (err) {

    console.log("PAYMENT ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});

router.post("/free-plan", async (req, res) => {

  try {

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User required"
      });
    }

    // Remove old subscriptions
    await Subscription.deleteMany({ userId });

    const sub = new Subscription({

      userId,
      plan: "FREE",

      tweetLimit: plans.FREE.limit,

      startDate: new Date(),
      endDate: null,

      paymentId: null

    });

    await sub.save(); // 🔥 CREATE DOCUMENT

    res.json({
      message: "Free plan activated"
    });

  } catch (err) {

    console.log("FREE PLAN ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});




/* Verify Payment */
router.post("/verify", async (req, res) => {

  try {

    const { paymentId, plan, userId } = req.body;

    if (!paymentId || !plan || !userId) {
      return res.status(400).json({
        message: "Missing fields"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Remove old subscription
    await Subscription.deleteMany({ userId });

    const sub = new Subscription({

      userId,
      plan,

      tweetLimit: plans[plan].limit,

      startDate: new Date(),

      endDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),

      paymentId

    });

    await sub.save(); // 🔥 SAVE

    await sendInvoice(
      user.email,
      plan,
      plans[plan].price,
      paymentId
    );

    res.json({
      message: "Subscription Activated"
    });

  } catch (err) {

    console.log("VERIFY ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});


export default router;
