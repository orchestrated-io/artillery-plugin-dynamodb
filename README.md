# artillery-plugin-dynamodb
A plugin for artillery.io that publishes response data to DynamoDB.

Based on [artillery-plugin-cloudwatch](https://github.com/Nordstrom/artillery-plugin-cloudwatch)

To use:

1. `npm install -g artillery`
2. `npm install artillery-plugin-dynamodb` (add `-g` if you like)
3. Add `dynamodb` plugin config to your "`hello.json`" Artillery script

    ```json
    {
      "config": {
        "plugins": {
          "dynamodb": {
              "table": "[INSERT_TOPIC_ARN]",
              "createTable": [true|false]
              "events": []
          }
        }
      }
    }
    ```

4. `artillery run hello.json`

This will cause every latency to be published to the given DynamoDB table.

This plugin assumes that the `aws-sdk` has been pre-configured, before it is loaded, with credentials and any other
setting that may be required to successfully `Publish` to the SNS topic.  This activity
requires at least the rights given by the following IAM statement to the CloudWatch API in order to report latencies:

```json
{
    "Effect": "Allow",
    "Action": [
        "dynamodb:PutItem",
    ],
    "Resource": ["arn:aws:dynamodb:`region`:`account-id`:table/`table-name`"]
}
```

If you want Artillery to automatically create the DynamoDB table, i.e. the `createTable` config is set to `true`, the 'dynamodb:CreateTable' action must be allowed on the same table resource.

For more information, see:

* https://github.com/shoreditch-ops/artillery
* http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html

Enjoy!
