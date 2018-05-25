// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../../../validation/SchemaValidator";
import { APISaveSnapshotRequest } from "../../../../message/APIMessages";
import { AggregateService } from "../../../../service/AggregateService";
import { HandleHttpResponse } from "../../../HandleHttpResponse";

export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  // validate Lambda incoming event
  const lambdaValidationResult = SchemaValidator.validateAPISaveSnapshotLambdaRequest(event);
  if (lambdaValidationResult.errors.length > 0) {
    HandleHttpResponse.badRequest(callback, {
      message: lambdaValidationResult.errors[0].message
    });
  }

  const aggregateId = event.pathParameters.aggregateId;
  const sequence = Number(event.pathParameters.sequence);
  const body: APISaveSnapshotRequest = JSON.parse(event.body);

  // validate body
  const bodyValidationResult = SchemaValidator.validateAPISaveSnapshotBodyRequest(body);
  if (bodyValidationResult.errors.length > 0) {
    HandleHttpResponse.badRequest(callback, {
      message: bodyValidationResult.errors[0].message
    });
  }

  AggregateService.saveSnapshot(aggregateId, sequence, body.payload)
    .then(() => {
      HandleHttpResponse.ok(callback, "");
    })
    .catch((err) => {
      HandleHttpResponse.internalError(callback, {
        message: err.message
      });
    });
};
