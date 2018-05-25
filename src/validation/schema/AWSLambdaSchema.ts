import { Schema } from "jsonschema";

export const AWSLambdaEventBodySchema: Schema = {
  id: "/AWS/Lambda/Event/Body",
  oneOf: [
    {
      type: "string"
    }
  ]
};
