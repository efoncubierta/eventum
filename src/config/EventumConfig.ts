export interface EventumAWSDynamoDBTable {
  tableName: string;
}

export interface EventumAWSDynamoDBConfig {
  events?: EventumAWSDynamoDBTable;
  snapshots?: EventumAWSDynamoDBTable;
}

export interface EventumAWSConfig {
  dynamodb?: EventumAWSDynamoDBConfig;
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

export const EventumConfigDefault: EventumConfig = {
  provider: EventumProvider.AWS,
  aws: {
    dynamodb: {
      events: {
        tableName: process.env.EVENTS_TABLE_NAME
      },
      snapshots: {
        tableName: process.env.SNAPSHOTS_TABLE_NAME
      }
    }
  },
  snapshot: {
    retention: {
      count: Number(process.env.SNAPSHOT_RETENTION_COUNT)
    }
  }
};
