const fs = require('fs');
const { log } = require('../utils');

module.exports = (() => {
    const files = fs
        .readdirSync(__dirname)
        .filter(
            (file) =>
                file.indexOf('.js') > 0 &&
                file !== 'index.js' &&
                file !== 'base.js'
        );
    const requireAWSService = (file) => {
        const Service = require(`${__dirname}/${file}`); // eslint-disable-line
        const { name } = Service;
        return { name, Service };
    };
    const services = {};
    for (const file of files) {
        try {
            const { name, Service } = requireAWSService(file);
            services[name] = (args) => {
                return new Service().setup(args);
            };
        } catch (err) {
            // init aws services failed
            log(`AWS Service require error: ${file}\n${err}`);
            throw err;
        }
    }
    return services;
})();
