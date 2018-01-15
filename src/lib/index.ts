
export interface RequestDescriptors {
  [n: string]: {
    rename_to?: string;
    get_keys?: boolean;
    list?: boolean;
    get_count?: boolean;
  };
}

export interface ParameterWhitelist {
  services: {
    [i: string]: {
      operations: {
        [op: string]: {
          request_parameters?: string[];
          response_parameters?: string[];
          request_descriptors?: RequestDescriptors;
        };
      };
    };
  };
}

// tslint:disable-next-line:no-var-requires
export const s3_whitelist: ParameterWhitelist = require('../../resources/s3_whitelist.json');
