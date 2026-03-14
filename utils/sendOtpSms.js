import twilio from "twilio";

export const sendOtpSms = async (phone, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhone) {
    console.error("Missing Twilio credentials in .env");
    return;
  }

  if (!phone) {
    console.error("No phone number provided to send SMS");
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    
    // Twilio requires E.164 format (+1234567890). Assuming India if no country code provided.
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;

    const response = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone,
    });
    
    console.log("Twilio SMS Sent: ", response.sid);
  } catch (error) {
    console.error("Twilio Error: ", error.message);
  }
};
