// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const { logger } = require('../utils');

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;
class Base {
    static get config() {
        return process.env.IS_LOCAL === 'true' ||
            process.env.IS_OFFLINE === 'true'
            ? {
                  accessKeyId: AWS_ACCESS_KEY_ID,
                  secretAccessKey: AWS_SECRET_ACCESS_KEY,
                  region: AWS_REGION,
              }
            : {};
    }

    static get mock() {
        return {};
    }

    setup() {
        // if (
        //     process.env.IS_LOCAL === 'true' ||
        //     process.env.IS_OFFLINE === 'true'
        // ) {
        //     this.mock();
        // }
        const instance = new AWS[this.constructor.name](
            this.constructor.config
        );
        for (const key in instance) {
            if (
                typeof instance[key] === 'function' &&
                instance.api.operations[key]
            ) {
                instance[key] = this.wrapMethod(instance[key], key);
            }
        }
        return instance;
    }

    wrapMethod(fn, key) {
        const defaultParams = this._params;
        const instanceName = this.constructor.name;
        // eslint-disable-next-line func-names
        return function (args) {
            try {
                const params = { ...args, ...defaultParams };
                logger.info(
                    `[AWS] ${instanceName} - ${key}: ${JSON.stringify(params)}`
                );
                return new Promise((resolve, reject) => {
                    fn.call(this, params, (err, data) => {
                        if (err) reject(err);
                        resolve(data);
                    });
                });
            } catch (e) {
                const { message, code, type, requestId } = e;
                logger.info(
                    `[AWS Error] ${instanceName} - ${key}: ${JSON.stringify({
                        message,
                        code,
                        type,
                        requestId,
                    })}`
                );
                throw e;
            }
        };
    }

    mock() {
        const AWSMock = require('aws-sdk-mock');
        for (const key of Object.keys(this.constructor.mock)) {
            AWSMock.mock(
                this.constructor.name,
                key,
                this.constructor.mock[key]
            );
        }
    }
}

module.exports = Base;
