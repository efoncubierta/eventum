// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { right, left } from "fp-ts/lib/Either";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { JournalService } from "../../service/JournalService";

// Eventum models
import { SnapshotInput } from "../../model/Snapshot";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { LambdaHandler } from "../LambdaHandler";

// Eventum errors
import { EventumError } from "../../error/EventumError";
import { ValidationError } from "../../error/ValidationError";

const saveSnapshot: LambdaHandler<SnapshotInput, void> = (snapshotInput: SnapshotInput) => {
  // validate body
  const validationResult = SchemaValidator.validateSnapshotInput(snapshotInput);
  if (validationResult.errors.length > 0) {
    return Promise.resolve(left<EventumError, void>(new ValidationError(validationResult.errors[0].message)));
  }

  // call saveSnapshot() and handle response
  return JournalService.saveSnapshot(snapshotInput).then(() => {
    return right<EventumError, void>(undefined);
  });
};

export const handler = wrapAWSLambdaHandler(saveSnapshot);
