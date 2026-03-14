import Tweet from "../models/tweet.js";

export const createTweet = async (req, res) => {
  try {
    const tweet = new Tweet(req.body);

    await tweet.save();

    return res.status(201).send(tweet);

  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};


export const getAllTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .sort({ timestamp: -1 })
      .populate("author");

    return res.status(200).send(tweets);

  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};


export const likeTweet = async (req, res) => {
  try {
    const { userId } = req.body;

    const tweet = await Tweet.findById(req.params.tweetid);

    if (!tweet.likedBy.includes(userId)) {
      tweet.likes += 1;
      tweet.likedBy.push(userId);
      await tweet.save();
    }

    res.send(tweet);

  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};


export const retweet = async (req, res) => {
  try {
    const { userId } = req.body;

    const tweet = await Tweet.findById(req.params.tweetid);

    if (!tweet.retweetedBy.includes(userId)) {
      tweet.retweets += 1;
      tweet.retweetedBy.push(userId);
      await tweet.save();
    }

    res.send(tweet);

  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};
