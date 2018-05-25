// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../../../validation/SchemaValidator";
import { AggregateService } from "../../../../service/AggregateService";
import { HandleHttpResponse } from "../../../HandleHttpResponse";

export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  // validate Lambda incoming event
  const lambdaValidationResult = SchemaValidator.validateAPIGetJournalLambdaRequest(event);
  if (lambdaValidationResult.errors.length > 0) {
    HandleHttpResponse.badRequest(callback, {
      message: lambdaValidationResult.errors[0].message
    });
  }

  const aggregateId = event.pathParameters.aggregateId;

  AggregateService.getJournal(aggregateId)
    .then((journal) => {
      if (journal) {
        HandleHttpResponse.ok(callback, JSON.stringify(journal));
      } else {
        HandleHttpResponse.notFound(callback, {
          message: `Journal(${aggregateId}) not found`
        });
      }
    })
    .catch((err) => {
      HandleHttpResponse.internalError(callback, {
        message: err.message
      });
    });
};
