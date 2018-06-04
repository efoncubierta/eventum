// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { right, left } from "fp-ts/lib/Either";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { JournalService } from "../../service/JournalService";

// Eventum models
import { EventInput, Event } from "../../model/Event";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { LambdaHandler } from "../LambdaHandler";

// Eventum errors
import { EventumError } from "../../error/EventumError";
import { ValidationError } from "../../error/ValidationError";

const snapshotService = new JournalService();

const saveEvents: LambdaHandler<EventInput[], Event[]> = (eventInputs: EventInput[]) => {
  // validate body
  const validationResult = SchemaValidator.validateEventInputArray(eventInputs);
  if (validationResult.errors.length > 0) {
    return Promise.resolve(left<EventumError, Event[]>(new ValidationError(validationResult.errors[0].message)));
  }

  // call saveEvents() and handle response
  return JournalService.saveEvents(eventInputs).then((events) => {
    return right<EventumError, Event[]>(events);
  });
};

export const handler = wrapAWSLambdaHandler(saveEvents);
