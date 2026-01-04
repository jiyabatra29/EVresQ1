const asyncHandler=require('express-async-handler');
const Host=require('../models/Host');
const generateToken=require('../config/generateToken');
const HomeChargerBooking = require('../models/HomeChargerBooking');
const mongoose= require('mongoose') ;

const registeredUser=asyncHandler(async (req,res)=>{
      const {name,email,password,phone,location,latitude,longitude}=req.body;
      if (!name || !email || !password || !phone || !location || !latitude || !longitude) {
          res.status(400);
          throw new Error("Please Enter all the Feilds");
      }
      const userExists=await Host.findOne({email});
      if (userExists) {
          res.status(400);
          throw new Error("User already exists");
      }
      const user = await Host.create({name,email,password,phone,location,latitude,longitude});
      if (user) {
        const token = generateToken(user._id,"Host");
          res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            token:token,
            latitude: user.latitude,
            longitude: user.longitude,  
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
      const users = await Host.find(keyword).find({ _id: { $ne: req.user._id } });
      console.log("✅ Users Found:", users);
      res.send(users);
  } catch (error) {
      console.error("❌ Error Searching Users:", error);
      res.status(500).json({ message: "Error fetching users" });
  }
});

const getAllRequests = async (req, res) => {
  try {
    const hostId = new mongoose.Types.ObjectId(req.user.id);
    const requests = await HomeChargerBooking.find({
      host: hostId,
      status: { $nin: ["completed", "rejected"] }
    }).populate("EVowner", "name email").sort({ createdAt: -1 });

    console.log("HOST ID 👉", hostId);
    console.log("REQUESTS FOUND 👉", requests);

    res.status(200).json(requests);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const booking = await HomeChargerBooking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });
    
    if (booking.host.toString() !== req.user.id.toString()) {
    res.status(403);
    throw new Error("You are not allowed to approve this booking");
    } 

    booking.status = "approved";
    await booking.save();

    res.json({ message: "Charging request approved", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const booking = await HomeChargerBooking.findById(req.params.id);
    if (booking.host.toString() !== req.user.id.toString()) {
    res.status(403);
    throw new Error("You are not allowed to approve this booking");
    }
    booking.status = "rejected";
    await booking.save();

    res.json({ message: "Charging request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const startCharging = async (req, res) => {
  try {
    const booking = await HomeChargerBooking.findById(req.params.id);
    if (booking.host.toString() !== req.user.id.toString()) {
    res.status(403);
    throw new Error("You are not allowed to approve this booking");
    } 
    booking.status = "charging";
    await booking.save();

    res.json({ message: "Charging started" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const completeCharging = async (req, res) => {
  try {
    const booking = await HomeChargerBooking.findById(req.params.id);
    if (booking.host.toString() !== req.user.id.toString()) {
    res.status(403);
    throw new Error("You are not allowed to approve this booking");
    }
    booking.status = "completed";
    await booking.save();

    res.json({ message: "Charging completed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await HomeChargerBooking.findById(req.params.id)
      .populate("EVowner", "name email phone")
      .populate("host", "name location");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // security check
    if (booking.host._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports={registeredUser,allUsers,getAllRequests,approveRequest,rejectRequest,startCharging,completeCharging,getBookingById};