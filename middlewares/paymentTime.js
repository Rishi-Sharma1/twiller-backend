import moment from "moment-timezone";

export const paymentTimeCheck = (req, res, next) => {

  // Development bypass removed for strict testing requirements

  const now = moment().tz("Asia/Kolkata");
  const hour = now.hour();

  if (hour >= 10 && hour < 11) {
    return next();
  }

  return res.status(403).json({
    message: "Payments allowed only between 10AM - 11AM IST"
  });
};
