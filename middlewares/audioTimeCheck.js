export const audioTimeCheck = (req, res, next) => {

  const now = new Date();

  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 60 * 60000);

  const hour = ist.getHours();

  if (hour < 14 || hour >= 19) {
    return res.status(403).json({
      message: "Audio uploads allowed only between 2PM and 7PM IST",
    });
  }

  next();
};