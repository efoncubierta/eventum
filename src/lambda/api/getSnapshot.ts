// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { AggregateService } from "../../service/AggregateService";
import { SchemaValidator } from "../../validation/SchemaValidator";
import { LambdaGetSnapshotRequest, LambdaGetSnapshotResponse } from "../../message/LambdaMessages";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { EventumLambdaHandler } from "../EventumLambdaHandler";
import { SnapshotNotFoundError } from "../error/SnapshotNotFoundError";
import { ValidationError } from "../error/ValidationError";

const getSnapshot: EventumLambdaHandler<LambdaGetSnapshotRequest, LambdaGetSnapshotResponse> = (
  request: LambdaGetSnapshotRequest
) => {
  // validate Lambda incoming event
  const validationResult = SchemaValidator.validateLambdaGetSnapshotRequest(request);
  if (validationResult.errors.length > 0) {
    return Promise.reject(new ValidationError(validationResult.errors[0].message));
  }

  // call getSnapshot() and handle response
  return AggregateService.getSnapshot(request.aggregateId, request.sequence).then((snapshot) => {
    if (snapshot) {
      return {
        snapshot
      } as LambdaGetSnapshotResponse;
    } else {
      throw new SnapshotNotFoundError(request.aggregateId, request.sequence);
    }
  });
};

export const handler: Handler = wrapAWSLambdaHandler(getSnapshot);
