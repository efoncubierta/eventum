// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { LambdaSaveSnapshotRequest } from "../../message/LambdaMessages";
import { AggregateService } from "../../service/AggregateService";
import { HandleLambdaResponse } from "../HandleLambdaResponse";

export const handler: Handler = (request: LambdaSaveSnapshotRequest, context: Context, callback: Callback) => {
  // validate body
  const validationResult = SchemaValidator.validateLambdaSaveSnapshotRequest(request);
  if (validationResult.errors.length > 0) {
    HandleLambdaResponse.badRequest(callback, validationResult.errors[0].message);
  }

  AggregateService.saveSnapshot(request.aggregateId, request.sequence, request.payload)
    .then(() => {
      HandleLambdaResponse.success(callback, {});
    })
    .catch((err) => {
      HandleLambdaResponse.unknown(callback, err.message);
    });
};
