// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { JournalService } from "../../service/JournalService";
import { SchemaValidator } from "../../validation/SchemaValidator";

// Eventum models
import { Nullable } from "../../typings/Nullable";
import { SnapshotKey, Snapshot } from "../../model/Snapshot";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { LambdaHandler } from "../LambdaHandler";

// Eventum errors
import { SnapshotNotFoundError } from "../../error/SnapshotNotFoundError";
import { ValidationError } from "../../error/ValidationError";

const getSnapshot: LambdaHandler<SnapshotKey, Nullable<Snapshot>> = (snapshotKey: SnapshotKey) => {
  // validate Lambda incoming event
  const validationResult = SchemaValidator.validateSnapshotKey(snapshotKey);
  if (validationResult.errors.length > 0) {
    return Promise.reject(new ValidationError(validationResult.errors[0].message));
  }

  // call getSnapshot() and handle response
  return JournalService.getSnapshot(snapshotKey.aggregateId, snapshotKey.sequence).then((snapshot) => {
    if (snapshot) {
      return snapshot;
    } else {
      throw new SnapshotNotFoundError(snapshotKey.aggregateId, snapshotKey.sequence);
    }
  });
};

export const handler = wrapAWSLambdaHandler(getSnapshot);
