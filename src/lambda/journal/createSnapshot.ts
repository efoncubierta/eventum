import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { SchemaValidator } from "../../validation/SchemaValidator";
import { JournalCreateSnapshotRequest } from "../../message/LambdaJournal";
import { JournalService } from "../../service/JournalService";

export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const body: JournalCreateSnapshotRequest = JSON.parse(event.body);

  // validate input
  const result = SchemaValidator.validateJournalCreateSnapshotRequest(body);
  if (result.errors.length > 0) {
    return callback(result.errors[0]);
  }

  JournalService.createSnapshot(body.aggregateId, body.sequence, body.payload)
    .then(() => {
      callback(null, {
        success: true
      });
    })
    .catch(callback);
};
