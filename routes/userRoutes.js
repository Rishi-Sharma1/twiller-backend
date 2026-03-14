import express from "express";
import {
  getLoggedInUser,
  updateUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import user from "../models/user.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
const router = express.Router();

router.get("/loggedinuser", getLoggedInUser);
router.patch("/update/:email", updateUser);

router.put("/toggle-notifications", protect, async (req, res) => {
  try {
    const updatedUser = await user.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          notificationsEnabled: !req.user.notificationsEnabled,
        },
      },
      { new: true }
    );

    res.json({
      notificationsEnabled: updatedUser.notificationsEnabled,
    });

  } catch (error) {
    console.error("Toggle route error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/change-language", protect, async (req, res) => {

  try {

    const { language } = req.body;

    if (!language) {
      return res.status(400).json({
        message: "Language is required"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findByIdAndUpdate(req.user._id, {
      pendingLanguage: language,
      languageOtp: otp,
      languageOtpExpiry: Date.now() + 5 * 60 * 1000
    });

    if (language === "fr") {
      await sendOtpEmail(req.user.email, otp);
    } else {
      console.log("Send OTP to mobile:", otp);
    }

    res.json({
      message: "OTP sent successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }

});

router.post("/verify-language-otp", protect, async (req, res) => {

  try {

    const { otp } = req.body;

    const user = await User.findById(req.user._id);

    if (!user.languageOtp || !user.languageOtpExpiry) {
      return res.status(400).json({
        message: "No OTP found"
      });
    }

    if (user.languageOtpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    if (user.languageOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    user.language = user.pendingLanguage;
    user.pendingLanguage = null;
    user.languageOtp = null;
    user.languageOtpExpiry = null;

    await user.save();

    res.json({
      message: "Language updated successfully",
      language: user.language
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});



export default router;
