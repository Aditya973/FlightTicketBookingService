const { BookingRepository } = require('../repositories/index');
const axios = require('axios');
const {FLIGHT_SERVICE_PATH, AUTH_SERVICE_PATH} = require('../config/serverConfig');
const {ServiceError} = require('../utils/errors/index');

const {createChannel,publishMessage} = require('../utils/messageQueue');
const {REMINDER_BINDING_KEY} = require('../config/serverConfig');

class BookingService{
    constructor(){
        this.bookingRepository = new BookingRepository();
    }

    async sendMessageToQueue(flightData){
        try {
            const userId = flightData.userId;
            let getUserRequestURL = `${AUTH_SERVICE_PATH}/api/v1/user/${userId}`;
            const user = await axios.get(getUserRequestURL);
            const userData = user.data.data;
            const userEmail = userData.email;
            const channel = await createChannel();
            const payload = {
                data:{
                    subject: 'Flight Booked',
                    content: `Your Flight has been booked \n flight No.:${flightData.flightId} \n Seats Booked:${flightData.noOfSeats} \n Price:${flightData.totalCost}`,
                    recepientEmail: userEmail,
                    notificationTime: '2023-06-19T15:00:00.000'
                },
                service : 'SEND_BASIC_EMAIL'
            };
            publishMessage(channel,REMINDER_BINDING_KEY,JSON.stringify(payload));     
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async createBooking(data){
        try {
            const flightId = data.flightId;
            let getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flight/${flightId}`;
            const flight = await axios.get(getFlightRequestURL);
            const flightData = flight.data.data;
            let priceOfTheFlight = flightData.price;
            if(data.noOfSeats > flightData.totalSeats){
                throw new ServiceError('something went wrong in the booking process','Insufficient seats');
            }
            const totalCost = priceOfTheFlight * data.noOfSeats;
            const bookingPayload = {...data,totalCost};
            const booking = await this.bookingRepository.create(bookingPayload);
            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flight/${booking.flightId}`;
            await axios.patch(updateFlightRequestURL,{totalSeats: flightData.totalSeats - booking.noOfSeats});
            const finalBooking = await this.bookingRepository.update(booking.id,{status : 'Booked'});
            await this.sendMessageToQueue(finalBooking);
            return finalBooking;
        } catch (error) {
            console.log(error);
            if(error.name == 'RepositoryError' || error.name == 'ValidationError'){
                throw error;
            }
            throw new ServiceError();
        }
    }
    
    async updateBooking(bookingId,data){
        try {
            const booking = await this.bookingRepository.get(bookingId);
            const flightId = booking.flightId;
            let getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flight/${flightId}`;
            const flight = await axios.get(getFlightRequestURL);
            const flightData = flight.data.data;
            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flight/${booking.flightId}`;
            console.log(booking.status," ",data.status," ",(booking.status !== data.status));
            if(data.status == 'Cancelled' && booking.status !== data.status){
                const finalBooking = await this.bookingRepository.update(bookingId,data);
                await axios.patch(updateFlightRequestURL,{totalSeats:flightData.totalSeats + finalBooking.noOfSeats});
                return finalBooking;
            }
            else if(data.status == 'Booked' && booking.status !== data.status){
                const finalBooking = await this.bookingRepository.update(bookingId,data);
                await axios.patch(updateFlightRequestURL,{totalSeats:flightData.totalSeats - finalBooking.noOfSeats});
                return finalBooking;
            }
            else{
                throw {error:'cannot update booking'};
            }
        } catch (error) {
            console.log(error);
            if(error.name == 'RepositoryError' || error.name == 'ValidationError'){
                throw error;
            }
            throw new ServiceError();            
        }
    }
}

module.exports = BookingService;