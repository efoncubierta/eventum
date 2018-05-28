import { Schema } from "jsonschema";

export const EventumConfigSchema: Schema = {
  id: "/Eventum/Config",
  type: "object",
  properties: {
    provider: {
      $ref: "/Eventum/Config/Provider"
    },
    aws: {
      $ref: "/Eventum/Config/AWS"
    },
    snapshot: {
      $ref: "/Eventum/Config/Snapshot"
    }
  },
  required: ["provider", "aws", "snapshot"]
};

export const EventumConfigProviderSchema: Schema = {
  id: "/Eventum/Config/Provider",
  type: "string",
  enum: ["AWS"]
};

export const EventumAWSConfigSchema: Schema = {
  id: "/Eventum/Config/AWS",
  type: "object",
  properties: {
    dynamodb: {
      $ref: "/Eventum/Config/AWS/DynamoDB"
    }
  },
  required: ["dynamodb"]
};

export const EventumAWSDynamoDBConfigSchema: Schema = {
  id: "/Eventum/Config/AWS/DynamoDB",
  type: "object",
  properties: {
    events: {
      $ref: "/Eventum/Config/AWS/DynamoDB/Table"
    },
    snapshots: {
      $ref: "/Eventum/Config/AWS/DynamoDB/Table"
    }
  },
  required: ["events", "snapshots"]
};

export const EventumAWSDynamoDBTableConfigSchema: Schema = {
  id: "/Eventum/Config/AWS/DynamoDB/Table",
  type: "object",
  properties: {
    tableName: {
      type: "string"
    }
  },
  required: ["tableName"]
};

export const EventumSnapshotConfigSchema: Schema = {
  id: "/Eventum/Config/Snapshot",
  type: "object",
  properties: {
    retention: {
      $ref: "/Eventum/Config/Snapshot/Retention"
    }
  },
  required: ["retention"]
};

export const EventumSnapshotRetentionConfigSchema: Schema = {
  id: "/Eventum/Config/Snapshot/Retention",
  type: "object",
  properties: {
    count: {
      type: "number",
      minimum: 0
    }
  },
  required: ["count"]
};
