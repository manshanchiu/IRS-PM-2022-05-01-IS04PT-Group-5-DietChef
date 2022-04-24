const Validator = require('../shared/services/validator');
const { Response } = require('../shared/services/response');

class Base {
    constructor(event, context) {
        this.event = event || {};
        this.context = context || {};
        this.params = this.event;
        this.isHTTP = false;
        if (
            (this.constructor.schemaValidation || process.env.IS_LOCAL) &&
            this.constructor.schema
        ) {
            this.validator = new Validator(this.constructor.schema);
        }
    }

    static get schemaValidation() {
        return true;
    }

    /** used to build handler */
    static build() {
        return {
            handler: (...input) => new this(...input).exec(),
        };
    }

    static isJSON(s) {
        try {
            JSON.parse(s);
            return true;
        } catch (err) {
            return false;
        }
    }

    static parseToJSON(obj) {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === 'string' && Base.isJSON(obj[key])) {
                obj[key] = JSON.parse(obj[key]);
                Base.parseToJSON(obj[key]);
            }
        });
    }

    async exec() {
        try {
            this.parseParams();
            if (this.validator) {
                this.validator.check(this.params, this.constructor.schema);
            }
            // return this.handler().then(Response.done).catch(Response.fail);
            const { response, data } = (await this.handler()) || {};
            await this.constructor.end();
            return Response.done(data, response);
        } catch (error) {
            console.log(error);
            return Response.fail(error);
        }
    }

    parseBody() {
        const contentType = this.event.headers['Content-Type'];
        let json = {};
        if (contentType === 'application/x-www-form-urlencoded') {
            for (const part of this.event.body.split('&')) {
                const [key, encodedValue] = part.split('=');
                json[key] = decodeURIComponent(encodedValue);
            }
        } else {
            json = JSON.parse(this.event.body);
        }
        return json;
    }

    parseParams() {
        if (this.event.httpMethod) {
            this.isHTTP = true;
            this.params = {
                ...this.event.pathParameters,
                ...this.event.queryStringParameters,
                ...this.parseBody(),
            };
        }
        // parse all to object if possible
        Base.parseToJSON(this.params);
        console.log(this.params);
    }

    static async end() {}
}

module.exports = Base;
