const Ajv = require('ajv');
const { AppError, ErrorCode } = require('./response');

class Validator {
    constructor(schema) {
        this.validate = this.constructor.ajv.compile(schema);
        this._schema = schema;
    }

    check(data) {
        const valid = this.validate(data || {});
        if (!valid) {
            const details = this.validate.errors.map(
                this.constructor._mapError
            );

            const error = new AppError(
                ErrorCode.General.InvalidParameters,
                new Error(),
                details
            );
            throw error;
        }
    }

    static get ajv() {
        if (!this._ajv) {
            this._ajv = new Ajv({
                format: 'full',
                allErrors: true,
                $data: true,
                coerceTypes: true,
            });
            this._addKeywords(this._ajv);
        }
        return this._ajv;
    }

    static _mapError(e) {
        return process.env.LOG_DETAILS !== 'disabled'
            ? `${e.dataPath} ${e.message} with ${JSON.stringify(e.params)}`
            : '';
    }

    static get customValidator() {
        return {
            convertToDateTime: {
                valid: true,
                schema: false,
                validate: (data, _dataPath, parentData, parentDataProperty) => {
                    if (data) {
                        // eslint-disable-next-line no-param-reassign
                        parentData[parentDataProperty] = new Date(data);
                    }
                },
            },
        };
    }

    /**
     * Add keywords to all instances of Ajv
     * @param  {...Ajv} ajvs instances of Ajv
     */
    static _addKeywords(ajv) {
        for (const [key, opts] of Object.entries(Validator.customValidator)) {
            ajv.addKeyword(key, opts);
        }
    }
}

module.exports = Validator;
