#!/usr/bin/env node

import * as AWS from 'aws-sdk';
import * as path from 'path';
import * as fs from 'fs';
import { ParameterWhitelist } from '../lib/index';

/**
 * Small program to generate a whitelist file for aws-sdk service
 */

if(process.argv.length < 5 || process.argv[1] === '-h' || process.argv[1] === '--help') {
  const programName = path.basename(__filename);
  console.log(`Usage: ${programName} <output file> <service_name> <param_names>+  
  Where each param name can also have an optional rename value separated by: ':'. For example: Bucket:bucket_name
  Example of generating for s3: ${programName} whitelist.out.json s3 Bucket:bucket_name Key VersionId Prefix CopySource`);
  process.exit(1);
}

const fileName = process.argv[2];
const jsonServiceName = process.argv[3].toLowerCase();
const awsServiceName = jsonServiceName.toUpperCase();

let params = process.argv.slice(4);
const renameParams: {[i: string]: string} = {};

params = params.map((p) => {
  if(p.includes(':')) {
    const pSplit = p.split(':');
    if(pSplit.length !== 2) {
      console.error("Failed parsing param name: ", p);
      process.exit(2);
    }
    renameParams[pSplit[0]] = pSplit[1];
    return pSplit[0];
  }
  return p;
});

const whitelist: ParameterWhitelist = {services: {}};
whitelist.services[jsonServiceName] = {operations: {}};
const operationsWhitelist = whitelist.services[jsonServiceName].operations;
const opsWithNoParams: string[] = [];
const service: any = new (AWS as any)[awsServiceName]();
const ops: any = service.api.operations;
for (const name of Object.getOwnPropertyNames(ops)) {  
  // console.log("op: %s, input: %s", name, ops[name].input.memberNames);
  const request_descriptors: any = {};
  const request_parameters: string[] = []; 
  const opParams: string[] = ops[name].input.memberNames;
  let hasParam = false;
  for (const p of opParams) {
    if(params.indexOf(p) >= 0) {
      if(renameParams[p]) {
        request_descriptors[p] = {rename_to: renameParams[p]};
      }
      else {
        request_parameters.push(p);
      }
      hasParam = true;
    }    
  }
  if(hasParam) {
    operationsWhitelist[name] = {};
    if(request_parameters.length > 0 ) {
      operationsWhitelist[name].request_parameters = request_parameters;      
    }
    if(Object.getOwnPropertyNames(request_descriptors).length > 0) {
      operationsWhitelist[name].request_descriptors = request_descriptors;
    }
  }
  else {
    opsWithNoParams.push(name);
  }    
}
console.log("Operations with no params: ", opsWithNoParams);
fs.writeFileSync(fileName, JSON.stringify(whitelist, undefined, 2));
console.log("JSON parameter whitelist written to: ", fileName);
