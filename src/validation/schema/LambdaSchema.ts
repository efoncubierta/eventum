import { Schema } from "jsonschema";

export const LambdaGetEventSchema: Schema = {
  id: "/Lambda/GetEvent",
  type: "object",
  properties: {
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    sequence: {
      $ref: "/Model/Sequence"
    }
  },
  required: ["aggregateId", "sequence"]
};

export const LambdaGetJournalSchema: Schema = {
  id: "/Lambda/GetJournal",
  type: "object",
  properties: {
    aggregateId: {
      $ref: "/Model/AggregateID"
    }
  },
  required: ["aggregateId"]
};

export const LambdaGetSnapshotSchema: Schema = {
  id: "/Lambda/GetSnapshot",
  type: "object",
  properties: {
    aggregateId: {
      $ref: "/Model/AggregateID"
    },
    sequence: {
      $ref: "/Model/Sequence"
    }
  },
  required: ["aggregateId", "sequence"]
};

export const LambdaSaveSnapshotSchema: Schema = {
  id: "/Lambda/SaveSnapshot",
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

export const LambdaSaveEventsSchema: Schema = {
  id: "/Lambda/SaveEvents",
  type: "object",
  properties: {
    events: {
      type: "array",
      items: {
        $ref: "/Model/Event"
      }
    }
  },
  required: ["events"]
};
