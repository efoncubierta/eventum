// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { AggregateService } from "../../service/AggregateService";
import { HandleLambdaResponse } from "../HandleLambdaResponse";
import { SchemaValidator } from "../../validation/SchemaValidator";
import { LambdaGetSnapshotRequest, LambdaGetSnapshotResponse } from "../../message/LambdaMessages";

export const handler: Handler = (request: LambdaGetSnapshotRequest, context: Context, callback: Callback) => {
  // validate Lambda incoming event
  const validationResult = SchemaValidator.validateLambdaGetSnapshotRequest(request);
  if (validationResult.errors.length > 0) {
    HandleLambdaResponse.badRequest(callback, validationResult.errors[0].message);
  }

  AggregateService.getSnapshot(request.aggregateId, request.sequence)
    .then((snapshot) => {
      if (snapshot) {
        HandleLambdaResponse.success(callback, {
          snapshot
        } as LambdaGetSnapshotResponse);
      } else {
        HandleLambdaResponse.notFound(callback, `Snapshot(${request.aggregateId}, ${request.sequence}) not found`);
      }
    })
    .catch((err) => {
      HandleLambdaResponse.unknown(callback, err.message);
    });
};
