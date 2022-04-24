const HttpStatus = require('./httpStatus');

const createError = (service, code, http = HttpStatus.InternalServerError) => ({
    service,
    code,
    http,
});

const ErrorCode = {
    General: {
        InternalServerError: createError(0, 0),
        BadRequest: createError(0, 1, HttpStatus.BadRequest),
        NotImplemented: createError(0, 2, HttpStatus.NotImplemented),
        InvalidParameters: createError(0, 3, HttpStatus.BadRequest),
        InvalidConfiguration: createError(0, 4),
    },
    Model: {
        General: createError(1, 0),
        BadRequest: createError(1, 1, HttpStatus.BadRequest),
    },
};

/**
 * Initialize ErrorCodes
 * @param {ErrorCode} errorCode
 */
const initializeErrors = (errorCode) => {
    for (const i of Object.keys(errorCode)) {
        for (const j of Object.keys(errorCode[i])) {
            errorCode[i][j].message = `${i} ${j}`; // eslint-disable-line no-param-reassign
        }
    }
};

initializeErrors(ErrorCode);
module.exports = ErrorCode;
