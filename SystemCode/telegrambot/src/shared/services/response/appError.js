const { logger } = require('../utils');
const ErrorCode = require('./errorCode');

class AppError extends Error {
    /**
     * @constructor
     * @param {ErrorCode} errorCode
     * @param {Error} error orignal error
     * @param {Array<string>} details message details
     */
    constructor(errorCode, error = new Error(), details = []) {
        super();
        this._errorCode = errorCode;
        this._error = error instanceof AppError ? error._error : error;
        this._details = details;
    }

    /**
     * Wrap Error to AppError
     * @param {Error} error
     */
    static wrap(error) {
        return error instanceof AppError
            ? error
            : new AppError(ErrorCode.General.InternalServerError, error, [
                  error.message,
              ]);
    }

    toString() {
        return `${AppError._code(this._errorCode)} ${this._error.stack}`;
    }

    toJSON() {
        if (process.env.NODE_ENV === 'development' || this.code.http >= 500) {
            logger.info(this.toString());
        }
        const errorCode = this._errorCode;
        return {
            statusCode: errorCode.http,
            body: JSON.stringify({
                code: AppError._code(errorCode),
                message: errorCode.message,
                details: this._details,
            }),
        };
    }

    get status() {
        return this._errorCode.http;
    }

    get code() {
        return this._errorCode;
    }

    get name() {
        return this._errorCode.message;
    }

    static _code(errorCode) {
        const service = `0${errorCode.service}`.slice(-2);
        const code = `0${errorCode.code}`.slice(-2);
        return `${errorCode.http}${service}${code}`;
    }
}

module.exports = AppError;
