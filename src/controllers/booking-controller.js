const { BookingService } = require('../services/index');
const {StatusCodes} = require('http-status-codes');

const bookingService = new BookingService();

const create = async (req,res) => {
    try {
        console.log(req.body);
        const response = await bookingService.createBooking(req.body);
        return res.status(StatusCodes.CREATED).json({
            data : response,
            success : true,
            message : 'succesfully created booking',
            err: {}
        })
    } catch (error) {
        return res.status(500).json({
            data: {},
            success:false,
            message: error.message,
            err : error.explanation
        });
    }
}

const update = async (req,res) => {
    try {
        const response = await bookingService.updateBooking(req.params.id,req.body);
        return res.status(StatusCodes.CREATED).json({
            data : response,
            success : true,
            message : 'succesfully created booking',
            err: {}
        })
    } catch (error) {
        return res.status(500).json({
            data: {},
            success:false,
            message: error.message,
            err : error.explanation
        });
    }
}

module.exports = {
    create, update
}