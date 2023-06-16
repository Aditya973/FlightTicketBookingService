const express = require('express'); 
const BookingController  = require('../../controllers/booking-controller');

const router = express.Router();
console.log("v1 index")
router.post('/booking',BookingController.create);

module.exports = router;