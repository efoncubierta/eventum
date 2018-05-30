// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { LambdaSaveEventsRequest } from "../../message/LambdaMessages";
import { AggregateService } from "../../service/AggregateService";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { EventumLambdaHandler } from "../EventumLambdaHandler";
import { ValidationError } from "../error/ValidationError";

const snapshotService = new AggregateService();

const saveEvents: EventumLambdaHandler<LambdaSaveEventsRequest, void> = (request: LambdaSaveEventsRequest) => {
  // validate body
  const validationResult = SchemaValidator.validateLambdaSaveEventsRequest(request);
  if (validationResult.errors.length > 0) {
    return Promise.reject(new ValidationError(validationResult.errors[0].message));
  }

  // call saveEvents() and handle response
  return AggregateService.saveEvents(request.events);
};

export const handler: Handler = wrapAWSLambdaHandler(saveEvents);
