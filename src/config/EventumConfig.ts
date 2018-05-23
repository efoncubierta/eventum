import * as yaml from "js-yaml";
import * as fs from "fs";

export interface EventumAWSStoreDetails {
  tableName: string;
}

export interface EventumAWSStoreConfig {
  journal?: EventumAWSStoreDetails;
  snapshot?: EventumAWSStoreDetails;
}

export interface EventumAWSStreamDetails {
  streamName: string;
}

export interface EventumAWSStreamConfig {
  event?: EventumAWSStreamDetails;
}

export interface EventumAWSConfig {
  store?: EventumAWSStoreConfig;
  stream?: EventumAWSStreamConfig;
}

export interface EventumSnapshotRetentionConfig {
  count: number;
}

export interface EventumSnapshotConfig {
  retention?: EventumSnapshotRetentionConfig;
}

export enum EventumProvider {
  AWS = "AWS"
}

export interface EventumConfig {
  provider?: EventumProvider;
  aws?: EventumAWSConfig;
  snapshot?: EventumSnapshotConfig;
}
