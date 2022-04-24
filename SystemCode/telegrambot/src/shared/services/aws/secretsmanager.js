// eslint-disable-next-line import/no-extraneous-dependencies
const Base = require('./base');

class SecretsManager extends Base {
    static get config() {
        return {
            ...super.config,
        };
    }
}

module.exports = SecretsManager;
