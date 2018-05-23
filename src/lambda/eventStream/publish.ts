import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { EventStreamPublishRequest } from "../../message/LambdaEventStream";
import { SchemaValidator } from "../../validation/SchemaValidator";
import { StreamFactory } from "../../stream/StreamFactory";
import { Event } from "../../model/Event";

const eventStream = StreamFactory.getEventStream();

export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const body: EventStreamPublishRequest = JSON.parse(event.body);

  // validate input
  const result = SchemaValidator.validateEventStreamPublishRequest(body);
  if (result.errors.length > 0) {
    return callback(result.errors[0]);
  }

  const e: Event = body.event;
  eventStream
    .publish(e)
    .then((status) => {
      callback(null, status);
    })
    .catch(callback);
};
