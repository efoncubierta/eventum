// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { JournalService } from "../../service/JournalService";

// Eventum models
import { EventInput, Event } from "../../model/Event";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { LambdaHandler } from "../LambdaHandler";

// Eventum errors
import { ValidationError } from "../../error/ValidationError";

const snapshotService = new JournalService();

const saveEvents: LambdaHandler<EventInput[], Event[]> = (eventInputs: EventInput[]) => {
  // validate body
  const validationResult = SchemaValidator.validateEventInputArray(eventInputs);
  if (validationResult.errors.length > 0) {
    return Promise.reject(new ValidationError(validationResult.errors[0].message));
  }

  // call saveEvents() and handle response
  return JournalService.saveEvents(eventInputs).then((events) => {
    return events;
  });
};

export const handler = wrapAWSLambdaHandler(saveEvents);
