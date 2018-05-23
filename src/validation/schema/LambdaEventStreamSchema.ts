import { Schema } from "jsonschema";

export const EventStreamPublishRequestSchema: Schema = {
  id: "/Lambda/EventStream/PublishRequest",
  type: "object",
  properties: {
    event: {
      $ref: "/Model/Event"
    }
  },
  required: ["event"]
};
