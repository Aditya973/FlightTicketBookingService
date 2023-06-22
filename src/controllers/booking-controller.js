const { BookingService } = require('../services/index');
const {StatusCodes} = require('http-status-codes');

const {createChannel,publishMessage} = require('../utils/messageQueue');
const {REMINDER_BINDING_KEY} = require('../config/serverConfig');

const bookingService = new BookingService();

class BookingController{
    constructor(){

    }
    async sendMessageToQueue(req,res){
        try {
            const channel = await createChannel();
            const payload = {
                data:{
                    subject: 'This is a notif from queue',
                    content: 'Some queue will subscribe',
                    recepientEmail: 'tiwariaditya973@gmail.com',
                    notificationTime: '2023-06-19T15:00:00.000'
                },
                service : 'CREATE_TICKET'
            };
            publishMessage(channel,REMINDER_BINDING_KEY,JSON.stringify(payload));
            return res.status(200).json({
                message:'successfully published the event'
            });     
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async create(req,res){
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
    
    async update(req,res){
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
    
}

// const create = async (req,res) => {
//     try {
//         console.log(req.body);
//         const response = await bookingService.createBooking(req.body);
//         return res.status(StatusCodes.CREATED).json({
//             data : response,
//             success : true,
//             message : 'succesfully created booking',
//             err: {}
//         })
//     } catch (error) {
//         return res.status(500).json({
//             data: {},
//             success:false,
//             message: error.message,
//             err : error.explanation
//         });
//     }
// }

// const update = async (req,res) => {
//     try {
//         const response = await bookingService.updateBooking(req.params.id,req.body);
//         return res.status(StatusCodes.CREATED).json({
//             data : response,
//             success : true,
//             message : 'succesfully created booking',
//             err: {}
//         })
//     } catch (error) {
//         return res.status(500).json({
//             data: {},
//             success:false,
//             message: error.message,
//             err : error.explanation
//         });
//     }
// }

module.exports = BookingController;