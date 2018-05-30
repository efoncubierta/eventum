import { Schema } from "jsonschema";

export const AggregateIdSchema: Schema = {
  id: "/Model/AggregateID",
  type: "string"
};

export const SequenceSchema: Schema = {
  id: "/Model/Sequence",
  type: "number",
  minimum: 0
};

export const EventSchema: Schema = {
  id: "/Model/Event",
  type: "object",
  properties: {
    eventType: {
      type: "string"
    },
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    sequence: {
      $ref: "/Model/Sequence"
    },
    payload: {
      type: "object"
    }
  },
  required: ["eventType", "aggregateId", "sequence"]
};

export const SnapshotSchema: Schema = {
  id: "/Model/Snapshot",
  type: "object",
  properties: {
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    sequence: {
      $ref: "/Model/Sequence"
    },
    payload: {
      type: "object"
    }
  },
  required: ["aggregateId", "sequence", "payload"]
};

export const JournalSchema: Schema = {
  id: "/Model/Journal",
  type: "object",
  properties: {
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    snapshot: {
      $ref: "/Model/Snapshot"
    },
    events: {
      type: "array",
      items: {
        $ref: "/Model/Event"
      }
    }
  },
  required: ["aggregateId", "snapshot", "events"]
};
