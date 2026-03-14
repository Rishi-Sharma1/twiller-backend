import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendOtpEmail = async (email, otp) => {

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Language Change OTP",
    text: `Your OTP for changing language is ${otp}. It expires in 5 minutes.`
  };

  await transporter.sendMail(mailOptions);
};