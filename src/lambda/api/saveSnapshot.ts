// AWS dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { SchemaValidator } from "../../validation/SchemaValidator";
import { JournalService } from "../../service/JournalService";

// Eventum models
import { SnapshotInput } from "../../model/Snapshot";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { LambdaHandler } from "../LambdaHandler";

// Eventum errors
import { ValidationError } from "../../error/ValidationError";

const saveSnapshot: LambdaHandler<SnapshotInput, void> = (snapshotInput: SnapshotInput) => {
  // validate body
  const validationResult = SchemaValidator.validateSnapshotInput(snapshotInput);
  if (validationResult.errors.length > 0) {
    return Promise.reject(new ValidationError(validationResult.errors[0].message));
  }

  // call saveSnapshot() and handle response
  return JournalService.saveSnapshot(snapshotInput);
};

export const handler = wrapAWSLambdaHandler(saveSnapshot);
