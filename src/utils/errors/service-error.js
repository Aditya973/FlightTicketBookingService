const { StatusCodes } = require('http-status-codes');

class ServiceError extends Error {
    constructor(
        message = 'something went wrong',
        explanation = 'Service layer error',
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR
        ) {
        super();
        this.name = 'ServieError';
        this.message = message;
        this.explanation = explanation;
        this.statusCode = statusCode;
    }
}

module.exports = ServiceError;