export interface EventumAWSDynamoDBTable {
  tableName: string;
}

export interface EventumAWSDynamoDBConfig {
  events: EventumAWSDynamoDBTable;
  snapshots: EventumAWSDynamoDBTable;
}

export interface EventumAWSConfig {
  dynamodb: EventumAWSDynamoDBConfig;
}

export interface EventumSnapshotRetentionConfig {
  count: number;
}

export interface EventumSnapshotConfig {
  retention: EventumSnapshotRetentionConfig;
}

export enum EventumProvider {
  AWS = "AWS"
}

export interface EventumConfig {
  provider: EventumProvider;
  stage: string;
  aws: EventumAWSConfig;
  snapshot: EventumSnapshotConfig;
}

export const EventumConfigDefault: EventumConfig = {
  provider: EventumProvider.AWS,
  stage: "dev",
  aws: {
    dynamodb: {
      events: {
        tableName: process.env.EVENTS_TABLE_NAME || "eventum-dev-events"
      },
      snapshots: {
        tableName: process.env.SNAPSHOTS_TABLE_NAME || "eventum-dev-snapshots"
      }
    }
  },
  snapshot: {
    retention: {
      count: Number(process.env.SNAPSHOT_RETENTION_COUNT)
    }
  }
};
