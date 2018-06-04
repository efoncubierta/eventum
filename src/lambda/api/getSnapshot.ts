// External dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { Option } from "fp-ts/lib/Option";
import { left, right } from "fp-ts/lib/Either";

// Eventum dependencies
import { JournalService } from "../../service/JournalService";
import { SchemaValidator } from "../../validation/SchemaValidator";

// Eventum models
import { SnapshotKey, Snapshot } from "../../model/Snapshot";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { LambdaHandler } from "../LambdaHandler";

// Eventum errors
import { EventumError } from "../../error/EventumError";
import { SnapshotNotFoundError } from "../../error/SnapshotNotFoundError";
import { ValidationError } from "../../error/ValidationError";

const getSnapshot: LambdaHandler<SnapshotKey, Snapshot> = (snapshotKey: SnapshotKey) => {
  // validate Lambda incoming event
  const validationResult = SchemaValidator.validateSnapshotKey(snapshotKey);
  if (validationResult.errors.length > 0) {
    return Promise.resolve(left<EventumError, Snapshot>(new ValidationError(validationResult.errors[0].message)));
  }

  // call getSnapshot() and handle response
  return JournalService.getSnapshot(snapshotKey).then((snapshotOpt) => {
    return snapshotOpt.foldL(
      () => left<EventumError, Snapshot>(new SnapshotNotFoundError(snapshotKey)),
      (snapshot) => right<EventumError, Snapshot>(snapshot)
    );
  });
};

export const handler = wrapAWSLambdaHandler(getSnapshot);
