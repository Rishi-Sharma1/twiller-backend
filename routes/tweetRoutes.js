import express from "express";
import {
  createTweet,
  getAllTweets,
  likeTweet,
  retweet,
} from "../controllers/tweetController.js";
import { tweetLimitCheck } from "../middlewares/tweetLimit.js";

const router = express.Router();

router.post("/", createTweet);
router.get("/", getAllTweets);

router.post("/like/:tweetid", likeTweet);
router.post("/retweet/:tweetid", retweet);

router.post("/tweet", tweetLimitCheck, createTweet);

export default router;
