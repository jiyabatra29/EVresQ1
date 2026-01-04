const express= require('express');
const router=express.Router()
const {registeredUser,allUsers,getAllHosts,bookHomeCharger,getMyBookingForHost} = require('../controllers/EVownerController')
const {protect}=require('../middleware/authMiddleware')
const {getHostById,updateBookingLocation, bookingloocation}=require('../controllers/EVownerController')

router.route('/').post(registeredUser).get(protect,allUsers);
router.get('/hosts', protect, getAllHosts);
router.post("/book-home-charger", protect, bookHomeCharger);
router.get(
  "/my-booking/:hostId",
  protect,   // EV owner auth
  getMyBookingForHost
);

router.post("/update-location/:bookingId", protect, updateBookingLocation);
router.get("/booking-location/:bookingId", protect, bookingloocation);

router.get("/:hostId", protect, getHostById); // dynamic route last

module.exports=router;
