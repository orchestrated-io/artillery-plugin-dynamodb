'use strict';

const zlib = require('zlib');
const debug = require('debug')('plugin:dynamodb');

var aws = require('aws-sdk'),
	dynamodb = new aws.DynamoDB(),
	constants = {
		PLUGIN_NAME: 'dynamodb',
		PLUGIN_PARAM_TABLE: 'table',
		PLUGIN_PARAM_CREATETABLE: 'createTable',
		THE: 'The "',
		CONFIG_REQUIRED: '" plugin requires configuration under <script>.config.plugins.',
		PARAM_REQUIRED: '" parameter is required',
		PARAM_MUST_BE_STRING: '" param must have a string value',
		PARAM_MUST_HAVE_LENGTH_OF_AT_LEAST_ONE: '" param must have a length of at least one',
		PARAM_MUST_BE_ARRAY: '" param must have an array value',
		// Report Array Positions
		TIMESTAMP: 0,
		REQUEST_ID: 1,
		LATENCY: 2,
		STATUS_CODE: 3
	},
	messages = {
		pluginConfigRequired: constants.THE + constants.PLUGIN_NAME + constants.CONFIG_REQUIRED + constants.PLUGIN_NAME,
		pluginParamTableRequired: constants.THE + constants.PLUGIN_PARAM_TABLE + constants.PARAM_REQUIRED,
		pluginParamTableMustBeString: constants.THE + constants.PLUGIN_PARAM_TABLE + constants.PARAM_MUST_BE_STRING,
		pluginParamTableMustHaveALengthOfAtLeastOne: constants.THE + constants.PLUGIN_PARAM_TABLE + constants.PARAM_MUST_HAVE_LENGTH_OF_AT_LEAST_ONE
	},
	impl = {
		validateConfig: function(scriptConfig) {
			// Validate that plugin config exists
			if (!(scriptConfig && scriptConfig.plugins && constants.PLUGIN_NAME in scriptConfig.plugins)) {
				throw new Error(messages.pluginConfigRequired);
			}
			// Validate TABLE
			if (!(constants.PLUGIN_PARAM_TABLE in scriptConfig.plugins[constants.PLUGIN_NAME])) {
				throw new Error(messages.pluginParamTopicArnRequired);
			} else if (!('string' === typeof scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_TABLE] ||
				scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_TABLE] instanceof String)) {
				throw new Error(messages.pluginParamTopicArnMustBeString);
			} else if (scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_TABLE].length === 0) {
				throw new Error(messages.pluginParamTopicArnMustHaveALengthOfAtLeastOne);
			}
		},
		buildDynamoDBParams: function(topicArn, subject, compressMessage, report) {
			let reportStr = report;
			if (typeof report !== "string") {
				reportStr = JSON.stringify(reportStr, null, 2);  
			}
			let message = reportStr;
			if (compressMessage) {
				message = zlib.deflateSync(message).toString('base64');
			}
			var dynamodbParams = {
				TopicArn: topicArn,
				Subject: subject,
				Message: message
			};
			return dynamodbParams;
		},
		createTable: function() {
			let createTable = this.config[constants.PLUGIN_PARAM_CREATETABLE] ? self.config[constants.PLUGIN_PARAM_CREATETABLE] : false;
			if (createTable) {
				let tableName = this.config[constants.PLUGIN_PARAM_TABLE];
				var params = {
					AttributeDefinitions: [
						{
							AttributeName: "uid", 
							AttributeType: "S"
						}, 
						{
							AttributeName: "timestamp", 
							AttributeType: "N"
						}
					], 
					KeySchema: [
						{
							AttributeName: "uid", 
							KeyType: "HASH"
						}, 
						{
							AttributeName: "timestamp", 
							KeyType: "RANGE"
						}
					], 
					ProvisionedThroughput: {
						ReadCapacityUnits: 5, 
						WriteCapacityUnits: 5
					}, 
					TableName: tableName
				};
				dynamodb.createTable(params, function(err, data) {
					if (err) debug("Error creating table", err, err.stack);
				});
			}
		},
    updateItem: function(uid, values) {
			let tableName = this.config[constants.PLUGIN_PARAM_TABLE];
      let timestamp = process.hrtime();
      let attributeNames = {};
      let attributeValues = {};
      let updateExpression = "SET ";

      for (var property in values) {
        attributeNames["#" + property] = property;
        attributeValues[":" + property] = values[property];
        updateExpression += " #" + property + " = :" + property;
      }
			var params = {
				ExpressionAttributeNames: attributeNames, 
				ExpressionAttributeValues: attributeValues, 
				Key: {
					"uid": {
						S: uid
					}, 
					"timestamp": {
						N: timestamp.toString()
					}
				}, 
				ReturnValues: "ALL_NEW", 
				TableName: tableName, 
				UpdateExpression: updateExpression
			};
			dynamodb.updateItem(params, function(err, data) {
				if (err) debug("Error updating item", err, err.stack);
			});
    },
		DynamoDBPlugin: function(scriptConfig, eventEmitter) {
			var self = this,
				reportError = function (err) {
					if (err) {
						debug('Error publishing to DynamoDB table:', err);
					}
				};
			self.config = JSON.parse(JSON.stringify(scriptConfig.plugins[constants.PLUGIN_NAME]));
      this.createTable();
			eventEmitter.on('response', function (delta, code, uid) {
        values = {
          delta: delta,
          code: code,
        };
        this.updateItem(uid, values);
      });
		}
	},
	api = {
		init: function (scriptConfig, eventEmitter) {
			impl.validateConfig(scriptConfig);
			return new impl.DynamoDBPlugin(scriptConfig, eventEmitter);
		}
	};

/**
 * Configuration:
 *  {
 *      "config": {
 *          "plugins": {
 *              "dynamodb": {
 *                  "table": "[INSERT_TABLE_NAME]",
 *              }
 *          }
 *      }
 *  }
 */
module.exports = api.init;

/* test-code */
module.exports.constants = constants;
module.exports.messages = messages;
module.exports.impl = impl;
module.exports.api = api;
/* end-test-code */
