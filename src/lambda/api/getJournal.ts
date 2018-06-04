// External dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { Option } from "fp-ts/lib/Option";
import { left, right } from "fp-ts/lib/Either";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { JournalService } from "../../service/JournalService";

// Eventum models
import { JournalKey, Journal } from "../../model/Journal";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { LambdaHandler } from "../LambdaHandler";

// Eventum errors
import { EventumError } from "../../error/EventumError";
import { JournalNotFoundError } from "../../error/JournalNotFoundError";
import { ValidationError } from "../../error/ValidationError";

const getJournal: LambdaHandler<JournalKey, Journal> = (journalKey: JournalKey) => {
  // validate Lambda incoming request
  const validationResult = SchemaValidator.validateJournalKey(journalKey);
  if (validationResult.errors.length > 0) {
    return Promise.resolve(left<EventumError, Journal>(new ValidationError(validationResult.errors[0].message)));
  }

  // call getJournal() and handle response
  return JournalService.getJournal(journalKey.aggregateId).then((journalOpt) => {
    return journalOpt.foldL(
      () => left<EventumError, Journal>(new JournalNotFoundError(journalKey.aggregateId)),
      (journal) => right<EventumError, Journal>(journal)
    );
  });
};

export const handler = wrapAWSLambdaHandler(getJournal);
