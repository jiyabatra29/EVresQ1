const asyncHandler=require('express-async-handler');
const Driver=require('../models/Driver');
const generateToken=require('../config/generateToken')

const registeredUser=asyncHandler(async (req,res)=>{
      const {name,email,password,phone,licenseNumber, vehicleNumber,preferredLocation,}=req.body;
      if (!name || !email || !password || !phone || !licenseNumber || !vehicleNumber || !preferredLocation) {
          res.status(400);
          throw new Error("Please Enter all the Feilds");
      }
      const userExists=await Driver.findOne({email});
      if (userExists) {
          res.status(400);
          throw new Error("User already exists");
      }
      const user = await Driver.create({name,email,password,phone,licenseNumber,vehicleNumber,preferredLocation});
      if (user) {
        const token = generateToken(user._id,"Driver");
          res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            licenseNumber: user.licenseNumber,
            vehicleNumber: user.vehicleNumber,
            preferredLocation: user.preferredLocation,
            token:token
          });
        } else {
          res.status(400);
          throw new Error("User not found");
        }
});

const allUsers = asyncHandler(async (req, res) => {
  console.log("🔍 Backend Received Search Query:", req.query.search);
  console.log("🛠 Authenticated User:", req.user);

  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } }, // Case insensitive
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  console.log(" Searching Users in DB with:", JSON.stringify(keyword));

  try {
      const users = await Driver.find(keyword).find({ _id: { $ne: req.user._id } });
      console.log("✅ Users Found:", users);
      res.send(users);
  } catch (error) {
      console.error("❌ Error Searching Users:", error);
      res.status(500).json({ message: "Error fetching users" });
  }
});

module.exports={registeredUser,allUsers};
