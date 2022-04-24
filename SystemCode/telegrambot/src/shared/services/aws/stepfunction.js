// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const Base = require('./base');

class StepFunctions extends Base {
    static get config() {
        return {
            ...super.config,
            ...((process.env.IS_LOCAL === 'true' ||
                process.env.IS_OFFLINE === 'true') && {
                endpoint: new AWS.Endpoint('http://localhost:8083'),
            }),
        };
    }
}

module.exports = StepFunctions;
