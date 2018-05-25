// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../../validation/SchemaValidator";
import { APISaveEventsRequest } from "../../../message/APIMessages";
import { AggregateService } from "../../../service/AggregateService";
import { HandleHttpResponse } from "../../HandleHttpResponse";

const snapshotService = new AggregateService();

export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  // validate Lambda incoming event
  const lambdaValidationResult = SchemaValidator.validateAPISaveEventsLambdaRequest(event);
  if (lambdaValidationResult.errors.length > 0) {
    HandleHttpResponse.badRequest(callback, {
      message: lambdaValidationResult.errors[0].message
    });
  }

  const body: APISaveEventsRequest = JSON.parse(event.body);

  // validate body
  const bodyValidationResult = SchemaValidator.validateAPISaveEventsBodyRequest(body);
  if (bodyValidationResult.errors.length > 0) {
    HandleHttpResponse.badRequest(callback, {
      message: bodyValidationResult.errors[0].message
    });
  }

  AggregateService.saveEvents(body.events)
    .then(() => {
      HandleHttpResponse.ok(callback, "");
    })
    .catch((err) => {
      HandleHttpResponse.internalError(callback, {
        message: err.message
      });
    });
};
