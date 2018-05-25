import { Schema } from "jsonschema";

export const APIGetEventLambdaRequestSchema: Schema = {
  id: "/API/GetEvent/LambdaRequest",
  type: "object",
  properties: {
    pathParameters: {
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
    },
    body: {
      $ref: "/AWS/Lambda/Event/Body"
    }
  },
  required: ["pathParameters"]
};

export const APIGetJournalLambdaRequestSchema: Schema = {
  id: "/API/GetJournal/LambdaRequest",
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        aggregateId: {
          $ref: "/Model/AggregateID"
        }
      },
      required: ["aggregateId"]
    }
  },
  required: ["pathParameters"]
};

export const APIGetSnapshotLambdaRequestSchema: Schema = {
  id: "/API/GetSnapshot/LambdaRequest",
  type: "object",
  properties: {
    pathParameters: {
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
    }
  },
  required: ["pathParameters"]
};

export const APISaveSnapshotLambdaRequestSchema: Schema = {
  id: "/API/SaveSnapshot/LambdaRequest",
  type: "object",
  properties: {
    pathParameters: {
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
    },
    body: {
      $ref: "/AWS/Lambda/Event/Body"
    }
  },
  required: ["pathParameters", "body"]
};

export const APISaveSnapshotBodyRequestSchema: Schema = {
  id: "/API/SaveSnapshot/BodyRequest",
  type: "object",
  properties: {
    payload: {
      type: "object"
    }
  },
  required: ["payload"]
};

export const APISaveEventsLambdaRequestSchema: Schema = {
  id: "/API/SaveEvents/LambdaRequest",
  type: "object",
  properties: {
    body: {
      $ref: "/AWS/Lambda/Event/Body"
    }
  },
  required: ["body"]
};

export const APISaveEventsBodyRequestSchema: Schema = {
  id: "/API/SaveEvents/BodyRequest",
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
