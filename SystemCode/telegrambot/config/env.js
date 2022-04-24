const fs = require('fs');
const path = require('path');

const { NODE_ENV } = process.env;
if (!NODE_ENV) {
    throw new Error(
        'The NODE_ENV environment variable is required but was not specified.'
    );
}

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [`.env.${NODE_ENV}`, '.env'];
// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
dotenvFiles.forEach((dotenvFile) => {
    const envFile = path.resolve(__dirname, '..', dotenvFile);
    if (fs.existsSync(envFile)) {
        // eslint-disable-next-line global-require
        require('dotenv').config({
            path: envFile,
        });
    }
});
