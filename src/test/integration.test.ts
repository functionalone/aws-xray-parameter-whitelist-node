//simulate lambda env
process.env.AWS_XRAY_CONTEXT_MISSING = 'LOG_ERROR';
process.env.LAMBDA_TASK_ROOT='/var/task';
process.env._X_AMZN_TRACE_ID='Root=1-5a5c010f-c09575a4325cba6f9fdc3322;Parent=328b968f2703345d;Sampled=0';

//load local bucket name from ".env" file
import * as dotenv from 'dotenv';
dotenv.config();

import * as XRay from 'aws-xray-sdk-core';
import * as AWS from 'aws-sdk';
import {s3_whitelist} from '../lib/index';
import * as logger from 'winston';
import {assert} from 'chai';

describe('sdk integration tests', function() {

  const BUCKET = process.env.TEST_S3_BUCKET;  
  const KEY = "aws-xray-parameter-whitelist-node/s3-test-object";
  this.timeout(30000);  

  before(function() {
    assert.isNotEmpty(BUCKET, "Bucket name is not set. Make sure to set the variable TEST_S3_BUCKET in .env file");
    //initialize xray
    XRay.setLogger(logger);  
    XRay.appendAWSWhitelist(s3_whitelist);
    XRay.middleware.setSamplingRules({
      default: {
        fixed_target: 10,
        rate: 1,
      },
      version: 1,
    });
    XRay.captureAWS(AWS);    
    XRay.SegmentUtils.setStreamingThreshold(100); //lambda changes this to 0. for the test we want to examine subsegments.    
  });

  it('s3 call should add bucket and key parameter to segment', async function() {
    const s3 = new AWS.S3();
    const res1 = await s3.putObject({
      Bucket: BUCKET!,
      Key: KEY,
      Body: 'Test object from aws-xray-parameter-whitelist-node',    
    }).promise();
    assert.isNotEmpty(res1);
    const segment = XRay.getSegment();
    assert.isNotEmpty(segment);
    const subsegments: any[] = segment.subsegments;
    let s3segment: any = null; 
    for (const sub of subsegments) {
      if(sub.name === 's3') {
        s3segment = sub;
        break;
      }
    }
    assert.equal(s3segment.aws.bucket_name, BUCKET);
    assert.equal(s3segment.aws.key, KEY);
    console.log("sub segment aws:", s3segment.aws);
  });

});
