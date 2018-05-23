import { Schema } from "jsonschema";

export const JournalSaveEventsRequestSchema: Schema = {
  id: "/Lambda/Journal/SaveEventsRequest",
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

export const JournalGetJournalRequestSchema: Schema = {
  id: "/Lambda/Journal/GetJournal",
  type: "object",
  properties: {
    aggregateId: {
      $ref: "/Model/AggregateID"
    }
  },
  required: ["aggregateId"]
};

export const JournalCreateSnapshotRequestSchema: Schema = {
  id: "/Lambda/Journal/CreateSnapshot",
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
