import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { SchemaValidator } from "../../validation/SchemaValidator";
import { JournalGetJournalRequest } from "../../message/LambdaJournal";
import { JournalService } from "../../service/JournalService";

export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const body: JournalGetJournalRequest = JSON.parse(event.body);

  // validate input
  const result = SchemaValidator.validateJournalGetJournalRequest(body);
  if (result.errors.length > 0) {
    return callback(result.errors[0]);
  }

  const aggregateId = body.aggregateId;

  JournalService.getJournal(aggregateId)
    .then((journal) => {
      callback(null, {
        journal
      });
    })
    .catch(callback);
};
