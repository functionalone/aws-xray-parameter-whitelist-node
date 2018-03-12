AWS X-Ray Parameter Whitelist - Node 
===================

Configure AWS X-Ray with additional parameter whitelist options.

AWS X-Ray supports a parameter whitelist which specifies what parameters should be included in trace segments when performing outgoing AWS SDK calls. The default parameter file which is included with the X-Ray Node SDK adds parameters to the following services: DynamoDB, SQS, SNS (publish method only), Lambda, S3 (starting with version 1.2.0) (file is available: [here](https://github.com/aws/aws-xray-sdk-node/blob/master/packages/core/lib/resources/aws_whitelist.json)). If you wish to include parameters for other services there is need to configure a custom parameter whitelist file. In the AWS X-Ray Node SDK this requires calling `AWSXRay.setAWSWhitelist` or `AWSXRay.appendAWSWhitelist` as documented [here](https://github.com/aws/aws-xray-sdk-node/blob/master/packages/core/README.md#aws-sdk-whitelist-configuration).  

This project aims at providing additional parameter whitelists with support for additional services not yet included in the default implementation. Parameter whitelist configurations are exported separately for each service and should be added using the `AWSXRay.appendAWSWhitelist` api. The parameter whitelist files are kept under the `resources` directory and are also available to be used directly. 

Services added in the project:
* S3 - Starting with version 1.2.0 of the X-Ray Node SDK S3 is included by default and it is recommended to use the latest version of the SDK to obtain S3 support. Request parameters: BucketName, Key, VersionId, Prefix.
* SNS - Support for addtional request parameters and methods. Request parameters: TopicArn, Name, Endpoint, Protocol, SubscriptionArn, Platform, PlatformApplicationArn, TargetArn, EndpointArn 

## Installation

```
npm install --save aws-xray-parameter-whitelist
``` 

## Usage Example

Following is a code example which should be added during the initialization of the application:
```
const AWSXRay = require('aws-xray-sdk');
const whitelists = require('aws-xray-parameter-whitelist');
AWSXRay.appendAWSWhitelist(whitelists.sns_whitelist)
```
After the configuration is setup, trace calls to SNS will include the TopicArn. X-Ray will provide the parameter details as part of the `aws` section of the trace. Example trace subsegment for SNS listSubscriptionsByTopic: 

```json
{
    "id": "4b1fd180bd9678f2",
    "name": "SNS",
    "start_time": 1520849681.61,
    "end_time": 1520849681.714,
    "http": {
        "response": {
            "status": 200
        }
    },
    "aws": {
        "operation": "ListSubscriptionsByTopic",
        "region": "us-east-1",
        "request_id": "0b537b2c-4c01-5f50-b619-280c195091e7",
        "retries": 0,
        "topic_arn": "arn:aws:sns:us-east-1:123456789012:test-topic"
    },
    "namespace": "aws"
}
```

# Generating Your Own Parameter Whitelist

You can generate your own parameter whitelist using a provided utility script. For example you can use this script to generate a parameter whitelist for an additional service not yet included. The compiled script is available at: `dist/util/generate-param-whitelist.js` as part of the npm package distribution. 

Usage:
```
generate-param-whitelist.js <output file> <service_name> <param_names>+
Where each param name can also have an optional rename value separated by: ':'
```

Usage example used for generating S3 whitelist:
```
dist/util/generate-param-whitelist.js whitelist.out.json s3 Bucket:bucket_name Key VersionId Prefix CopySource
```
