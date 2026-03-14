import nodemailer from "nodemailer";

export const sendResetMail = async (email, content) => {

  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Login OTP Verification",
      text: content
    });

  } catch (err) {
    console.log("Mail error:", err);
  }
};
