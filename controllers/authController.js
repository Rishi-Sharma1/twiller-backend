import User from "../models/user.js";
import useragent from "useragent";
import otpGenerator from "otp-generator";
import { sendResetMail } from "../utils/sendResetMail.js";
import { sendOtpSms } from "../utils/sendOtpSms.js";


export const register = async (req, res) => {
  try {
    const existinguser = await User.findOne({
      email: req.body.email,
    });

    if (existinguser) {
      return res.status(200).send(existinguser);
    }

    const newUser = new User(req.body);
    await newUser.save();

    return res.status(201).send(newUser);

  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ message: "Email or phone required" });
    }

    const user = await User.findOne({
      $or: [{ email: value }, { phone: value }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Daily limit check
    if (user.lastPasswordReset) {
      const last = new Date(user.lastPasswordReset);
      const now = new Date();

      if (
        last.getDate() === now.getDate() &&
        last.getMonth() === now.getMonth() &&
        last.getFullYear() === now.getFullYear()
      ) {
        return res.status(400).json({
          message: "You can use this option only one time per day",
        });
      }
    }

    // Generate random A-Za-z password
    let newPassword = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < 10; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    user.password = newPassword; // Store in db
    user.lastPasswordReset = new Date();
    await user.save();

    if (value === user.phone) {
      await sendOtpSms(user.phone, `Your new generated password is: ${newPassword}`);
    } else {
      await sendResetMail(user.email, `Your new generated password is: ${newPassword}\n\nPlease login using this password.`);
    }

    res.json({
      message: "Reset email sent successfully!",
      email: user.email,
      generatedPassword: newPassword, // Sending back so UI can display it or just let the user know
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyLoginOtp = async (req, res) => {

  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || !user.loginOtp) {
    return res.status(400).json({
      message: "Invalid request"
    });
  }

  if (new Date() > user.otpExpiry) {
    return res.status(400).json({
      message: "OTP expired"
    });
  }

  if (user.loginOtp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP"
    });
  }

  const agent = useragent.parse(req.headers["user-agent"]);

  user.loginHistory.push({
    browser: agent.family,
    os: agent.os.family,
    device:
      agent.device.family === "Other"
        ? "Desktop"
        : agent.device.family,
    ip:
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress
  });

  user.loginOtp = null;
  user.otpExpiry = null;

  await user.save();

  res.json({
    message: "OTP verified"
  });
}

export const validateLogin = async (req, res) => {

  try {

    const { email, password, usingCustomDBLogin } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (usingCustomDBLogin) {
      if (user.password && user.password === password) {
        // valid
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    const agent = useragent.parse(req.headers["user-agent"]);

    const browser = agent.family;
    const os = agent.os.family;

    let device = "Desktop";

    if (agent.device.family !== "Other") {
      device = agent.device.family;
    }

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;

    // 🔴 MOBILE TIME RESTRICTION
    const rawUA = req.headers["user-agent"] ? req.headers["user-agent"].toLowerCase() : "";
    const isMobile = rawUA.includes("mobile") || rawUA.includes("iphone") || rawUA.includes("android");
    
    if (isMobile) {

      const now = new Date();
      const hour = now.getHours();

      if (hour < 10 || hour >= 13) {
        return res.status(403).json({
          message:
            "Mobile login allowed only between 10 AM and 1 PM"
        });
      }
    }

    // 🟡 CHROME OTP REQUIRED
    const isEdge = rawUA.includes("edg") || rawUA.includes("edge");
    const isChrome = rawUA.includes("chrome") && !isEdge;

    if (isChrome) {

      const otp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
        alphabets: false
      });

      user.loginOtp = otp;
      user.otpExpiry =
        new Date(Date.now() + 5 * 60 * 1000);

      await user.save();

      await sendResetMail(
        user.email,
        `Your login OTP is: ${otp}`
      );

      return res.json({
        otpRequired: true
      });
    }

    // 🟢 Microsoft Browser (Edge) → No OTP

    user.loginHistory.push({
      browser,
      os,
      device,
      ip
    });

    await user.save();

    res.json({
      otpRequired: false
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({ message: "Server error" });
  }
};

export const requestLanguageOtp = async (req, res) => {
  try {
    const { lang, email, phone } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });
    user.loginOtp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    if (lang === "fr") {
      await sendResetMail(email, `Your language change OTP is: ${otp}`);
    } else {
      if (!phone && !user.phone) {
         return res.status(400).json({ message: "No phone number linked to this account." });
      }
      const targetPhone = phone || user.phone;
      await sendOtpSms(targetPhone, `Your language change OTP is: ${otp}`);
    }

    res.json({ message: "Language switch OTP sent" });
  } catch (error) {
    res.status(500).json({ message: "Error requesting language OTP" });
  }
};

export const verifyLanguageOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.loginOtp !== otp) {
      return res.status(400).json({ message: "Invalid request or OTP" });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.loginOtp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Language OTP verified" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

