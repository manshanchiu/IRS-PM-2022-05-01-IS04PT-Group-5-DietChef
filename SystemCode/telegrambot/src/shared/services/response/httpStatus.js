const HttpStatus = {
    Ok: 200,
    Created: 201,
    NoContent: 204,
    Found: 302,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    Gone: 410,
    UnprocessableEntity: 422,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
};

for (const key of Object.keys(HttpStatus)) {
    HttpStatus[HttpStatus[key]] = key;
}

module.exports = HttpStatus;
