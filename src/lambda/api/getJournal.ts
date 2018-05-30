// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { AggregateService } from "../../service/AggregateService";
import { LambdaGetJournalRequest, LambdaGetJournalResponse } from "../../message/LambdaMessages";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { EventumLambdaHandler } from "../EventumLambdaHandler";
import { JournalNotFoundError } from "../error/JournalNotFoundError";
import { ValidationError } from "../error/ValidationError";

const getJournal: EventumLambdaHandler<LambdaGetJournalRequest, LambdaGetJournalResponse> = (
  request: LambdaGetJournalRequest
) => {
  // validate Lambda incoming request
  const validationResult = SchemaValidator.validateLambdaGetJournalRequest(request);
  if (validationResult.errors.length > 0) {
    return Promise.reject(new ValidationError(validationResult.errors[0].message));
  }

  // call getJournal() and handle response
  return AggregateService.getJournal(request.aggregateId).then((journal) => {
    if (journal) {
      return {
        journal
      } as LambdaGetJournalResponse;
    } else {
      throw new JournalNotFoundError(request.aggregateId);
    }
  });
};

export const handler: Handler = wrapAWSLambdaHandler(getJournal);
