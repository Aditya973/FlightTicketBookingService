const { BookingRepository } = require('../repositories/index');
const axios = require('axios');
const {FLIGHT_SERVICE_PATH} = require('../config/serverConfig');
const {ServiceError} = require('../utils/errors/index');

class BookingService{
    constructor(){
        this.bookingRepository = new BookingRepository();
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
            return finalBooking;
        } catch (error) {
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