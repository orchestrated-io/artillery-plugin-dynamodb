'use strict';

var AWS_SDK = 'aws-sdk',
    DYNAMODB_PLUGIN = __dirname + '/../lib/dynamodb.js',
    aws = require(AWS_SDK),
    expect = require('chai').expect,
    dynamodb,
    script = {
        config: {
            plugins: {
                dynamodb: {
                    table: 'MY_TABLE'
                }
            }
        }
    };
aws.config.credentials.accessKeyId = '12345678901234567890';
aws.config.credentials.secretAccessKey = '1234567890123456789012345678901234567890';
aws.config.credentials.sessionToken = '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234==';
aws.config.credentials.region = 'my-region';

dynamodb = require(DYNAMODB_PLUGIN);

describe('DYNAMODB Plugin Tests', function() {
    before(function() {
        console.log('Running DYNAMODB Plugin Tests');
    });
    after(function() {
        console.log('Completed DYNAMODB Plugin Tests');
    });
    describe('Validate the configuration of the plugin', function() {
        it('Expects configuration to be provided', function () {
            expect(function () {
                dynamodb.impl.validateConfig(null);
            }).to.throw(dynamodb.messages.pluginConfigRequired);
            expect(function () {
                dynamodb.impl.validateConfig({});
            }).to.throw(dynamodb.messages.pluginConfigRequired);
            expect(function () {
                dynamodb.impl.validateConfig({ plugins: {} });
            }).to.throw(dynamodb.messages.pluginConfigRequired);
        });
        it('Expects configuration to include the attribute `topicArn` with a string value', function () {
            expect(function () {
                dynamodb.impl.validateConfig({ plugins: { dynamodb: {} } });
            }).to.throw(dynamodb.messages.pluginParamTopicArnRequired);
            expect(function () {
                dynamodb.impl.validateConfig({ plugins: { dynamodb: { topicArn: {} } } });
            }).to.throw(dynamodb.messages.pluginParamTopicArnMustBeString);
            expect(function () {
                dynamodb.impl.validateConfig({ plugins: { dynamodb: { topicArn: true } } });
            }).to.throw(dynamodb.messages.pluginParamTopicArnMustBeString);
            expect(function () {
                dynamodb.impl.validateConfig({ plugins: { dynamodb: { topicArn: 1 } } });
            }).to.throw(dynamodb.messages.pluginParamTopicArnMustBeString);
            expect(function() {
                dynamodb.impl.validateConfig({ plugins: { dynamodb: { topicArn: '' } } });
            }).to.throw(dynamodb.messages.pluginParamTopicArnMustHaveALengthOfAtLeastOne);
        });
        it('Expects valid aws-sdk configuration credentials', function() {
            // delete require.cache[require.resolve('aws-sdk')];
            // delete require.cache[require.resolve('aws-sdk')];
        });
        it('Expects a valid aws-sdk configuration region', function() {
            // delete require.cache[require.resolve('aws-sdk')];
            // delete require.cache[require.resolve('aws-sdk')];
        });
        it('Expects valid configuration produce a usable plugin', function () {
            expect(function() {
                dynamodb.impl.validateConfig(script.config);
            }).to.not.throw('config is valid');
        });
    });
});
