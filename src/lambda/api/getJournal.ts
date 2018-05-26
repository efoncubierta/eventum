// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { AggregateService } from "../../service/AggregateService";
import { HandleLambdaResponse } from "../HandleLambdaResponse";
import { LambdaGetJournalRequest, LambdaGetJournalResponse } from "../../message/LambdaMessages";

export const handler: Handler = (request: LambdaGetJournalRequest, context: Context, callback: Callback) => {
  // validate Lambda incoming request
  const validationResult = SchemaValidator.validateLambdaGetJournalRequest(request);
  if (validationResult.errors.length > 0) {
    HandleLambdaResponse.badRequest(callback, validationResult.errors[0].message);
  }

  AggregateService.getJournal(request.aggregateId)
    .then((journal) => {
      if (journal) {
        HandleLambdaResponse.success(callback, {
          journal
        } as LambdaGetJournalResponse);
      } else {
        HandleLambdaResponse.notFound(callback, `Journal(${request.aggregateId}) not found`);
      }
    })
    .catch((err) => {
      HandleLambdaResponse.unknown(callback, err.message);
    });
};
