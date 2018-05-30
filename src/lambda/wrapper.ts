// external dependencies
import { Callback, Context, Handler } from "aws-lambda";

// eventum lambda dependencies
import { EventumLambdaHandler } from "./EventumLambdaHandler";

// eventum lambda errors
import { EventNotFoundError } from "./error/EventNotFoundError";
import { JournalNotFoundError } from "./error/JournalNotFoundError";
import { SnapshotNotFoundError } from "./error/SnapshotNotFoundError";
import { NotFoundError } from "./error/NotFoundError";
import { ValidationError } from "./error/ValidationError";
import { BadRequestError } from "./error/BadRequestError";
import { LambdaError } from "./error/LambdaError";

export function wrapAWSLambdaHandler(handler: EventumLambdaHandler<any, any>): Handler {
  return (event, context: Context, callback: Callback) => {
    // invoke function
    handler(event)
      .then((result) => {
        // handle successful responses
        handleSuccessResponse(callback, result);
      })
      .catch((err) => {
        // handle lambda predefined errors
        if (err instanceof LambdaError) {
          handleErrorResponse(callback, err.errorType, err.message);
        } else {
          handleErrorResponse(callback, "Unknown", err.message);
        }
      });
  };
}

function handleResponse(callback: Callback, responseType: string, responsePayload: any) {
  callback(null, {
    $type: responseType,
    ...responsePayload
  });
}

function handleSuccessResponse(callback: Callback, payload: any) {
  handleResponse(callback, "Success", payload);
}

function handleErrorResponse(callback: Callback, type: string, message: string, payload?: any) {
  handleResponse(callback, type, {
    message,
    payload
  });
}
