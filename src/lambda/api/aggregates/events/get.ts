// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { AggregateService } from "../../../../service/AggregateService";
import { HttpResponse } from "../../../HttpResponse";
import { HandleHttpResponse } from "../../../HandleHttpResponse";
import { SchemaValidator } from "../../../../validation/SchemaValidator";

export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  // validate Lambda incoming event
  const lambdaValidationResult = SchemaValidator.validateAPIGetEventLambdaRequest(event);
  if (lambdaValidationResult.errors.length > 0) {
    HandleHttpResponse.badRequest(callback, {
      message: lambdaValidationResult.errors[0].message
    });
  }

  const aggregateId = event.pathParameters.aggregateId;
  const sequence = Number(event.pathParameters.sequence);

  AggregateService.getEvent(aggregateId, sequence)
    .then((e) => {
      if (e) {
        HandleHttpResponse.ok(callback, JSON.stringify(e));
      } else {
        HandleHttpResponse.notFound(callback, {
          message: `Event(${aggregateId}, ${sequence}) not found`
        });
      }
    })
    .catch((err) => {
      HandleHttpResponse.internalError(callback, {
        message: err.message
      });
    });
};
