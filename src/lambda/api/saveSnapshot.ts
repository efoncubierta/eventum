// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { LambdaSaveSnapshotRequest } from "../../message/LambdaMessages";
import { AggregateService } from "../../service/AggregateService";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { EventumLambdaHandler } from "../EventumLambdaHandler";
import { ValidationError } from "../error/ValidationError";

const saveSnapshot: EventumLambdaHandler<LambdaSaveSnapshotRequest, void> = (request: LambdaSaveSnapshotRequest) => {
  // validate body
  const validationResult = SchemaValidator.validateLambdaSaveSnapshotRequest(request);
  if (validationResult.errors.length > 0) {
    return Promise.reject(new ValidationError(validationResult.errors[0].message));
  }

  // call saveSnapshot() and handle response
  return AggregateService.saveSnapshot(request.aggregateId, request.sequence, request.payload);
};

export const handler: Handler = wrapAWSLambdaHandler(saveSnapshot);
