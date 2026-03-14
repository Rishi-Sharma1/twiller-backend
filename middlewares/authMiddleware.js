// import User from "../models/user.js";

// export const protect = async (req, res, next) => {
//   try {
//     const email = req.headers["user-email"];

//     if (!email) {
//       return res.status(401).json({
//         message: "Not authorized",
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({
//         message: "User not found",
//       });
//     }

//     req.user = user;
//     next();

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };


import User from "../models/user.js";

export const protect = async (req, res, next) => {
  try {
    

    const email = req.headers["user-email"];

    

    if (!email) {
      return res.status(401).json({
        message: "No email header",
      });
    }

    const user = await User.findOne({ email });

    

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    console.error("PROTECT ERROR:", error);
    res.status(500).json({ message: "Middleware crash" });
  }
};