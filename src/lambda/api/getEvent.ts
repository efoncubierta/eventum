// AWS dependencies
import { Callback, Context, Handler } from "aws-lambda";

// Eventum dependencies
import { AggregateService } from "../../service/AggregateService";
import { SchemaValidator } from "../../validation/SchemaValidator";
import { LambdaGetEventRequest, LambdaGetEventResponse } from "../../message/LambdaMessages";

// Eventum lambda dependencies
import { wrapAWSLambdaHandler } from "../wrapper";
import { EventumLambdaHandler } from "../EventumLambdaHandler";
import { EventNotFoundError } from "../error/EventNotFoundError";
import { ValidationError } from "../error/ValidationError";

const getEvent: EventumLambdaHandler<LambdaGetEventRequest, LambdaGetEventResponse> = (
  request: LambdaGetEventRequest
) => {
  // validate Lambda incoming request
  const validationResult = SchemaValidator.validateLambdaGetEventRequest(request);
  if (validationResult.errors.length > 0) {
    return Promise.reject(new ValidationError(validationResult.errors[0].message));
  }

  // call getEvent() and handle response
  return AggregateService.getEvent(request.aggregateId, request.sequence).then((event) => {
    if (event) {
      return {
        event
      } as LambdaGetEventResponse;
    } else {
      throw new EventNotFoundError(request.aggregateId, request.sequence);
    }
  });
};

export const handler: Handler = wrapAWSLambdaHandler(getEvent);
