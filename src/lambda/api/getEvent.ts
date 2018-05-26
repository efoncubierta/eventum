// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { AggregateService } from "../../service/AggregateService";
import { HandleLambdaResponse } from "../HandleLambdaResponse";
import { SchemaValidator } from "../../validation/SchemaValidator";
import { LambdaGetEventRequest, LambdaGetEventResponse } from "../../message/LambdaMessages";

export const handler: Handler = (request: LambdaGetEventRequest, context: Context, callback: Callback) => {
  // validate Lambda incoming request
  const validationResult = SchemaValidator.validateLambdaGetEventRequest(request);
  if (validationResult.errors.length > 0) {
    HandleLambdaResponse.badRequest(callback, validationResult.errors[0].message);
  }

  AggregateService.getEvent(request.aggregateId, request.sequence)
    .then((e) => {
      if (e) {
        HandleLambdaResponse.success(callback, {
          event: e
        } as LambdaGetEventResponse);
      } else {
        HandleLambdaResponse.notFound(callback, `Event(${request.aggregateId}, ${request.sequence}) not found`);
      }
    })
    .catch((err) => {
      HandleLambdaResponse.unknown(callback, err.message);
    });
};
