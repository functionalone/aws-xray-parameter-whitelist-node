AWS X-Ray Parameter Whitelist - Node 
===================

Configure AWS X-Ray with additional parameter whitelist options.

AWS X-Ray supports a parameter whitelist which specifies what parameters should be included in trace segments when performing outgoing AWS SDK calls. The default parameter file which is included with the X-Ray Node SDK adds parameters to the following services: DynamoDB, SQS, SNS, Lambda (file is available: [here](https://github.com/aws/aws-xray-sdk-node/blob/master/packages/core/lib/resources/aws_whitelist.json)). If you wish to include parameters for other services there is need to configure a custom parameter whitelist file. In the AWS X-Ray Node SDK this requires calling `AWSXRay.setAWSWhitelist` or `AWSXRay.appendAWSWhitelist` as documented [here](https://github.com/aws/aws-xray-sdk-node/blob/master/packages/core/README.md#aws-sdk-whitelist-configuration).  

This project aims at providing additional parameter whitelists with support for additional services not yet included in the default implementation. Parameter whitelist configurations are exported separately for each service and should be added using the `AWSXRay.appendAWSWhitelist` api. The parameter whitelist files are kept under the `resources` directory and are also available to be used directly. 

Services added in the project:
* S3 - Request parameters: BucketName, Key, VersionId, Prefix

## Installation

```
npm install --save aws-xray-parameter-whitelist
``` 

## Usage Example

Following is a code example which should be added during the initialization of the application:
```
const AWSXRay = require('aws-xray-sdk');
const whitelists = require('aws-xray-parameter-whitelist');
AWSXRay.appendAWSWhitelist(whitelists.s3_whitelist)
```
After the configuration is setup, trace calls to S3 will include the BucketName and Key. X-Ray will provide the parameter details as part of the `aws` section of the trace. Example trace subsegment for S3: 

```
{
    "id": "0fa7bf47a1d25b68",
    "name": "S3",
    "start_time": 1515938633.281,
    "end_time": 1515938633.781,
    "http": {
        "response": {
            "status": 200,
            "content_length": 0
        }
    },
    "aws": {
        "operation": "PutObject",
        "request_id": "B8D3A85E32F856E4",
        "key": "test-key/s3-test-object",
        "bucket_name": "test-bucket",
        "id_2": "JUQwHKNIt38s3d8E...",
        "resource_names": [
            "test-bucket"
        ]
    },
    "namespace": "aws"
}
```

# Generating Your Own Parameter Whitelist

You can generate your own parameter whitelist using a provided utility script. For example you can use this script to generate a parameter whitelist for an additional service not yet included.The compiled script is available at: `dist/util/generate-param-whitelist.js` as part of the npm package distribution. 

Usage:
```
generate-param-whitelist.js <output file> <service_name> <param_names>+
Where each param name can also have an optional rename value separated by: ':'
```

Usage example used for generating S3 whitelist:
```
dist/util/generate-param-whitelist.js whitelist.out.json s3 Bucket:bucket_name Key VersionId Prefix CopySource
```
