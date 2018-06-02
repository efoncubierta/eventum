// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { JournalService } from "../../service/JournalService";

// Eventum models
import { Nullable } from "../../typings/Nullable";
import { JournalKey, Journal } from "../../model/Journal";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { LambdaHandler } from "../LambdaHandler";

// Eventum errors
import { JournalNotFoundError } from "../../error/JournalNotFoundError";
import { ValidationError } from "../../error/ValidationError";

const getJournal: LambdaHandler<JournalKey, Nullable<Journal>> = (journalKey: JournalKey) => {
  // validate Lambda incoming request
  const validationResult = SchemaValidator.validateJournalKey(journalKey);
  if (validationResult.errors.length > 0) {
    return Promise.reject(new ValidationError(validationResult.errors[0].message));
  }

  // call getJournal() and handle response
  return JournalService.getJournal(journalKey.aggregateId).then((journal) => {
    if (journal) {
      return journal;
    } else {
      throw new JournalNotFoundError(journalKey.aggregateId);
    }
  });
};

export const handler = wrapAWSLambdaHandler(getJournal);
