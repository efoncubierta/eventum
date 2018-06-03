// external dependencies
import { Callback, Context, Handler } from "aws-lambda";

// Eventum lambda dependencies
import { LambdaResponse } from "./LambdaResponse";
import { SuccessResponse } from "./SuccessResponse";
import { ErrorResponse } from "./ErrorResponse";
import { LambdaHandler } from "./LambdaHandler";

// Eventum errors
import { EventumError } from "../error/EventumError";
import { ErrorType } from "../error/ErrorType";
import { ResponseType } from "./ResponseType";

export function wrapAWSLambdaHandler<I, O>(handler: LambdaHandler<I, O>): Handler<I, LambdaResponse<O>> {
  return (event: I, context: Context, callback: Callback<LambdaResponse<O>>) => {
    // invoke function
    handler(event)
      .then((result) => {
        // handle successful responses
        handleSuccessResponse(callback, result);
      })
      .catch((err) => {
        // handle lambda predefined errors
        if (err instanceof EventumError) {
          handleErrorResponse(callback, err.errorType, err.message);
        } else {
          handleErrorResponse(callback, ErrorType.Unknown, err.message);
        }
      });
  };
}

function handleSuccessResponse<O>(callback: Callback<SuccessResponse<O>>, payload: O) {
  callback(null, {
    type: ResponseType.OK,
    payload
  });
}

function handleErrorResponse(callback: Callback<ErrorResponse>, errorType: ErrorType, message: string) {
  callback(null, {
    type: ResponseType.ERROR,
    errorType,
    message
  });
}
