import User from "../models/user.js";

export const getLoggedInUser = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).send({ error: "Email required" });
    }

    const user = await User.findOne({ email });

    return res.status(200).send(user);

  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { email } = req.params;

    const updated = await User.findOneAndUpdate(
      { email },
      { $set: req.body },
      { new: true }
    );

    return res.status(200).send(updated);

  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};
