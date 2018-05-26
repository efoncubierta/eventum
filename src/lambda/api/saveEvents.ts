// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { LambdaSaveEventsRequest } from "../../message/LambdaMessages";
import { AggregateService } from "../../service/AggregateService";
import { HandleLambdaResponse } from "../HandleLambdaResponse";

const snapshotService = new AggregateService();

export const handler: Handler = (request: LambdaSaveEventsRequest, context: Context, callback: Callback) => {
  // validate body
  const validationResult = SchemaValidator.validateLambdaSaveEventsRequest(request);
  if (validationResult.errors.length > 0) {
    HandleLambdaResponse.badRequest(callback, validationResult.errors[0].message);
  }

  AggregateService.saveEvents(request.events)
    .then(() => {
      HandleLambdaResponse.success(callback, {});
    })
    .catch((err) => {
      HandleLambdaResponse.unknown(callback, err.message);
    });
};
