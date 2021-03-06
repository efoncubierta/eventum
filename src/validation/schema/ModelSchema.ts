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

export const DateSchema: Schema = {
  id: "/Model/Date",
  type: "string",
  format: "date-time"
};

export const EventIdSchema: Schema = {
  id: "/Model/EventID",
  type: "string"
};

export const EventPayloadSchema: Schema = {
  id: "/Model/EventPayload",
  type: "object"
};

export const EventSchema: Schema = {
  id: "/Model/Event",
  type: "object",
  properties: {
    eventId: {
      $ref: "/Model/EventID"
    },
    eventType: {
      type: "string"
    },
    source: {
      type: "string"
    },
    authority: {
      type: "string"
    },
    occurredAt: {
      $ref: "/Model/Date"
    },
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    sequence: {
      $ref: "/Model/Sequence"
    },
    payload: {
      $ref: "/Model/EventPayload"
    }
  },
  required: ["eventId", "eventType", "source", "authority", "occurredAt", "aggregateId", "sequence"],
  additionalProperties: false
};

export const EventKeySchema: Schema = {
  id: "/Model/EventKey",
  type: "object",
  properties: {
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    sequence: {
      $ref: "/Model/Sequence"
    }
  },
  required: ["aggregateId", "sequence"],
  additionalProperties: false
};

export const EventInputSchema: Schema = {
  id: "/Model/EventInput",
  type: "object",
  properties: {
    eventType: {
      type: "string"
    },
    source: {
      type: "string"
    },
    authority: {
      type: "string"
    },
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    payload: {
      $ref: "/Model/EventPayload"
    }
  },
  required: ["eventType", "source", "authority", "aggregateId"],
  additionalProperties: false
};

export const EventInputArraySchema: Schema = {
  id: "/Model/EventInputArray",
  type: "array",
  items: {
    $ref: "/Model/EventInput"
  }
};

export const SnapshotIdSchema: Schema = {
  id: "/Model/SnapshotID",
  type: "string"
};

export const SnapshotPayloadSchema: Schema = {
  id: "/Model/SnapshotPayload",
  type: "object"
};

export const SnapshotSchema: Schema = {
  id: "/Model/Snapshot",
  type: "object",
  properties: {
    snapshotId: {
      $ref: "/Model/SnapshotID"
    },
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    sequence: {
      $ref: "/Model/Sequence"
    },
    payload: {
      $ref: "/Model/SnapshotPayload"
    }
  },
  required: ["snapshotId", "aggregateId", "sequence", "payload"]
};

export const SnapshotKeySchema: Schema = {
  id: "/Model/SnapshotKey",
  type: "object",
  properties: {
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    sequence: {
      $ref: "/Model/Sequence"
    }
  },
  required: ["aggregateId", "sequence"],
  additionalProperties: false
};

export const SnapshotInputSchema: Schema = {
  id: "/Model/SnapshotInput",
  type: "object",
  properties: {
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    sequence: {
      $ref: "/Model/Sequence"
    },
    payload: {
      $ref: "/Model/SnapshotPayload"
    }
  },
  required: ["aggregateId", "sequence", "payload"],
  additionalProperties: false
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

export const JournalKeySchema: Schema = {
  id: "/Model/JournalKey",
  type: "object",
  properties: {
    aggregateId: {
      $ref: "/Model/AggregateID"
    }
  },
  required: ["aggregateId"],
  additionalProperties: false
};
