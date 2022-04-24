// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const Base = require('./base');

const { S3_BUCKET } = process.env;

class S3 extends Base {
    constructor(params) {
        super();
        this._params = params || {};
        this._params.Bucket = this._params.Bucket || S3_BUCKET;
    }

    static get config() {
        return {
            ...super.config,
            ...((process.env.IS_LOCAL === 'true' ||
                process.env.IS_OFFLINE === 'true') && {
                endpoint: new AWS.Endpoint('http://localhost:8000'),
                s3ForcePathStyle: true,
            }),
        };
    }
}

module.exports = S3;
