const AppError = require('./appError');
const HttpStatus = require('./httpStatus');

class Response {
    static done(data = {}, { statusCode = HttpStatus.Ok, headers } = {}) {
        return {
            statusCode,
            headers: {
                ...headers,
                'Access-Control-Allow-Origin': '*',
            },
            // body: JSON.stringify({
            //     data: data.results || data,
            //     meta: data.total && {
            //         total: data.total,
            //     },
            // }),
            body: true,
        };
    }

    static fail(error) {
        return AppError.wrap(error).toJSON();
    }
}

module.exports = Response;
