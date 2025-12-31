const express= require('express');
const router=express.Router()
const {registeredUser,allUsers} = require('../controllers/EVownerController')
const {protect}=require('../middleware/authMiddleware')

router.route('/').post(registeredUser).get(protect,allUsers);

module.exports=router;
