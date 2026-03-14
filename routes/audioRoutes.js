import express from "express";
import { uploadAudio } from "../middlewares/audioUpload.js";
import { audioTimeCheck } from "../middlewares/audioTimeCheck.js";
import { parseFile } from "music-metadata";
import AudioTweet from "../models/AudioTweet.js";
import User from "../models/user.js";
import { setAudioOtp, verifyAudioOtp } from "../utils/audioOtpStore.js";
import { sendResetMail } from "../utils/sendResetMail.js";

const router = express.Router();

/* Request OTP */
router.post("/request-otp", async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  console.log("BODY:", req.body);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  setAudioOtp(user.email, otp);

  await sendResetMail(user.email, otp);

  res.json({ message: "OTP sent successfully" });
});

/* Upload Audio */
router.post("/upload", audioTimeCheck, uploadAudio.single("audio"), async (req, res) => {
    try {
      const { otp, userId } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!verifyAudioOtp(user.email, otp)) {
        return res.status(403).json({
          message: "Invalid or expired OTP",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No audio file uploaded",
        });
      }

      const metadata = await parseFile(req.file.path);

      const duration = metadata.format.duration;

      if (duration > 300) {
        return res.status(400).json({
          message: "Audio must be under 5 minutes",
        });
      }

      const audioTweet = new AudioTweet({
        userId,
        audioUrl: req.file.path,
        duration,
      });

      await audioTweet.save();

      res.json({
        message: "Audio tweet posted successfully",
        audioTweet,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Upload failed",
      });
    }
  },
);

export default router;
