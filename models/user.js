import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  displayName: {
    type: String,
    required: true,
  },

  avatar: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    default: "",
  },

  bio: {
    type: String,
    default: "",
  },

  location: {
    type: String,
    default: "",
  },

  website: {
    type: String,
    default: "",
  },

  joinedDate: {
    type: Date,
    default: Date.now,
  },

  phone: {
    type: String,
    default: "",
  },

  lastPasswordReset: {
    type: Date,
    default: null,
  },
  loginHistory: [
    {
      browser: String,
      os: String,
      device: String,
      ip: String,
      time: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  loginOtp: {
    type: String,
    default: null,
  },

  otpExpiry: {
    type: Date,
    default: null,
  },
  notificationsEnabled: {
  type: Boolean,
  default: true,
},
language: {
  type: String,
  default: "en",
},

pendingLanguage: {
  type: String,
  default: null,
},

languageOtp: {
  type: String,
  default: null,
},

languageOtpExpiry: {
  type: Date,
  default: null,
},
});

export default mongoose.model("User", UserSchema);
