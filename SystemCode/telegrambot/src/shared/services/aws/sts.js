// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const Base = require('./base');

class STS extends Base {
    constructor(params) {
        super();
        this._params = params || {};
    }

    static get config() {
        return {
            ...super.config,
            ...((process.env.IS_LOCAL === 'true' ||
                process.env.IS_OFFLINE === 'true') && {
                endpoint: new AWS.Endpoint('http://localhost:8000'),
            }),
        };
    }

    static get mock() {
        return {
            assumeRoleWithSAML: {
                AssumedRoleUser: {
                    M: {
                        Arn: {
                            S:
                                'arn:aws:sts::602267132653:assumed-role/ADFS/trudysi@amazon.com',
                        },
                        AssumedRoleId: {
                            S: 'AROAYYOPLELWRKKTZUCXH:trudysi@amazon.com',
                        },
                    },
                },
                Audience: {
                    S:
                        'https://4evyguy8o8.execute-api.ap-southeast-2.amazonaws.com/test/saml',
                },
                Credentials: {
                    M: {
                        AccessKeyId: { S: 'ASIAYYOPLELW52JFBU6T' },
                        Expiration: { M: {} },
                        SecretAccessKey: {
                            S: 'XBgAVhDimOznoulfYjA1jJwQLzz5i1P/qjHevmxM',
                        },
                        SessionToken: {
                            S:
                                'FwoGZXIvYXdzEIT//////////wEaDA7E72ImvtNwltMmZyLhAQGJPVyAFGwy0vyjLxuF7IeiFyQjYdgNMp6FgDi1qL8KWnfxsZewhRv6eg9PmguSuvVH6mSnwwJAJiRM/X1z3DKmTJHsVflu7wrSELREidhPT6qf+TqhtU4ftcRtrUZHF1qOri9NmBnX17246wyMP8PzT+ZhNHdv5TW67I0Z5WD92HCXt4gApaR97BzUO4ui9UUb62Fc5+tTMhOZntgbah4jxf0TZK3wU3Qt58b3bwJb0aj6BQ7PNM8EVpSzq1F88zpWOK43xF+S4FnhtgMz/ZYp9Q2X13tzPpY69st1WVvFCyit8NX4BTIye9RE7QeKmpl/2HxwgJM4E3MbOL/Q3PMihZskdWD2rhIxgxouAd8+JN2vKyQlRrTpTfI=',
                        },
                    },
                },
                Issuer: {
                    S:
                        'http://EC2AMAZ-A96SCJ0.internalusers.gic.com/adfs/services/trust',
                },
                NameQualifier: { S: 'mwrBKwxeMyxE0/netMumRVW13kI=' },
                ResponseMetadata: {
                    M: {
                        RequestId: {
                            S: 'e0842b6e-9e60-444a-b14b-673f68697557',
                        },
                    },
                },
                Subject: { S: 'INTERNALUSERS\\trudy' },
                SubjectType: { S: 'persistent' },
            },
        };
    }
}
module.exports = STS;
