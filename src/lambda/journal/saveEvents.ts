import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { SchemaValidator } from "../../validation/SchemaValidator";
import { JournalSaveEventsRequest } from "../../message/LambdaJournal";
import { JournalService } from "../../service/JournalService";

const snapshotService = new JournalService();

export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const body: JournalSaveEventsRequest = JSON.parse(event.body);

  // validate input
  const result = SchemaValidator.validateJournalSaveEventsRequest(body);
  if (result.errors.length > 0) {
    return callback(result.errors[0]);
  }

  JournalService.saveEvents(body.events)
    .then((status) => {
      callback(null, status);
    })
    .catch(callback);
};
