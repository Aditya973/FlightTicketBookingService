const express = require('express'); 
const BookingController  = require('../../controllers/booking-controller');

const bookingController = new BookingController();

const router = express.Router();
console.log("v1 index")
router.post('/booking',bookingController.create);
router.patch('/booking/:id',bookingController.update);
router.post('/publish',bookingController.sendMessageToQueue);
router.get('/gateway',(req,res)=>{
    res.json({message:'ok'});
})

module.exports = router;