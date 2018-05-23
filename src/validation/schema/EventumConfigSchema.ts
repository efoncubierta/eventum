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
    stores: {
      $ref: "/Eventum/Config/AWS/Stores"
    },
    streams: {
      $ref: "/Eventum/Config/AWS/Streams"
    }
  },
  required: ["store", "stream"]
};

export const EventumAWSStoresConfigSchema: Schema = {
  id: "/Eventum/Config/AWS/Stores",
  type: "object",
  properties: {
    journal: {
      $ref: "/Eventum/Config/AWS/Stores/Store"
    },
    snapshot: {
      $ref: "/Eventum/Config/AWS/Stores/Store"
    }
  },
  required: ["journal", "snapshot"]
};

export const EventumAWSStoresStoreConfigSchema: Schema = {
  id: "/Eventum/Config/AWS/Stores/Store",
  type: "object",
  properties: {
    tableName: {
      type: "string"
    }
  },
  required: ["tableName"]
};

export const EventumAWSStreamsConfigSchema: Schema = {
  id: "/Eventum/Config/AWS/Streams",
  type: "object",
  properties: {
    event: {
      $ref: "/Eventum/Config/AWS/Streams/Stream"
    }
  },
  required: ["event"]
};

export const EventumAWSStreamsStreamConfigSchema: Schema = {
  id: "/Eventum/Config/AWS/Streams/Stream",
  type: "object",
  properties: {
    streamName: {
      type: "string"
    }
  },
  required: ["streamName"]
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
