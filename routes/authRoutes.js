import express from "express";
import { register, resetPassword, verifyLoginOtp, validateLogin, requestLanguageOtp, verifyLanguageOtp } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);

router.post("/reset-password", resetPassword);

router.post("/validate-login", validateLogin);

router.post("/verify-login-otp", verifyLoginOtp);

router.post("/request-language-otp", requestLanguageOtp);

router.post("/verify-language-otp", verifyLanguageOtp);

export default router;
