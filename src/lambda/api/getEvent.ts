// External dependencies
import { Callback, Context, Handler } from "aws-lambda";
import { Option } from "fp-ts/lib/Option";
import { left, right } from "fp-ts/lib/Either";

// Eventum dependencies
import { JournalService } from "../../service/JournalService";
import { SchemaValidator } from "../../validation/SchemaValidator";

// Eventum models
import { Event, EventKey } from "../../model/Event";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { LambdaHandler } from "../LambdaHandler";

// Eventum errors
import { EventumError } from "../../error/EventumError";
import { EventNotFoundError } from "../../error/EventNotFoundError";
import { ValidationError } from "../../error/ValidationError";

const getEvent: LambdaHandler<EventKey, Event> = (eventKey: EventKey) => {
  // validate Lambda incoming request
  const validationResult = SchemaValidator.validateEventKey(eventKey);
  if (validationResult.errors.length > 0) {
    return Promise.resolve(left<EventumError, Event>(new ValidationError(validationResult.errors[0].message)));
  }

  // call getEvent() and handle response
  return JournalService.getEvent(eventKey).then((eventOpt) => {
    return eventOpt.foldL(
      () => left<EventumError, Event>(new EventNotFoundError(eventKey)),
      (event) => right<EventumError, Event>(event)
    );
  });
};

export const handler = wrapAWSLambdaHandler(getEvent);
