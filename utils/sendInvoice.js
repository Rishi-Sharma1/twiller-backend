import nodemailer from "nodemailer";

export const sendInvoice = async (email, plan, amount, paymentId) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Subscription Invoice",

    html: `
      <h2>Subscription Confirmed</h2>
      <p>Plan: ${plan}</p>
      <p>Amount: ₹${amount}</p>
      <p>Payment ID: ${paymentId}</p>
      <p>Thank you for subscribing!</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
