const asyncHandler = require("express-async-handler");
const EVowner = require("../models/Evowner");
const Driver = require("../models/Driver");
const Host = require("../models/Host");
const generateToken = require("../config/generateToken");

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user, role;

  user = await EVowner.findOne({ email });
  if (user && await user.matchPassword(password)) {
    role = "EVowner";
  } else {
    user = await Driver.findOne({ email });
    if (user && await user.matchPassword(password)) {
      role = "Driver";
    } else {
      user = await Host.findOne({ email });
      if (user && await user.matchPassword(password)) {
        role = "Host";
      }
    }
  }

  if (!user) {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role,
    token: generateToken(user._id, role),
  });
});

module.exports = { loginUser };
