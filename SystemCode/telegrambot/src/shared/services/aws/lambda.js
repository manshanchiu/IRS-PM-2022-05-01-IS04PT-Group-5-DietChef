// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const Base = require('./base');

class Lambda extends Base {
    constructor(params) {
        super();
        this._params = params || {};
    }

    static get config() {
        return {
            ...super.config,
            // ...((process.env.IS_LOCAL === 'true' ||
            //     process.env.IS_OFFLINE === 'true') && {
            //     endpoint: 'http://localhost:3002',
            // }),
        };
    }
}
module.exports = Lambda;
