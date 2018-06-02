// AWS dependencies
import { Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { JournalService } from "../../service/JournalService";
import { SchemaValidator } from "../../validation/SchemaValidator";

// Eventum models
import { Nullable } from "../../typings/Nullable";
import { Event, EventKey } from "../../model/Event";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { LambdaHandler } from "../LambdaHandler";

// Eventum errors
import { EventNotFoundError } from "../../error/EventNotFoundError";
import { ValidationError } from "../../error/ValidationError";

const getEvent: LambdaHandler<EventKey, Nullable<Event>> = (eventKey: EventKey) => {
  // validate Lambda incoming request
  const validationResult = SchemaValidator.validateEventKey(eventKey);
  if (validationResult.errors.length > 0) {
    return Promise.reject(new ValidationError(validationResult.errors[0].message));
  }

  // call getEvent() and handle response
  return JournalService.getEvent(eventKey.aggregateId, eventKey.sequence).then((event) => {
    if (event) {
      return event;
    } else {
      throw new EventNotFoundError(eventKey.aggregateId, eventKey.sequence);
    }
  });
};

export const handler = wrapAWSLambdaHandler(getEvent);
