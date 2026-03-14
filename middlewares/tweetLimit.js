import Subscription from "../models/Subscription.js";

export const tweetLimitCheck = async (req, res, next) => {

  const userId = req.user.id;

  const sub = await Subscription.findOne({ userId });

  if (!sub) return next();

  if (sub.tweetLimit === Infinity) return next();

  if (sub.tweetLimit <= 0) {
    return res.status(403).json({
      message: "Tweet limit exceeded. Upgrade plan."
    });
  }

  sub.tweetLimit -= 1;
  await sub.save();

  next();
};
