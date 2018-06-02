import { EventumError } from "./EventumError";
import { ErrorType } from "./ErrorType";

export abstract class BadRequestError extends EventumError {
  public readonly errorType: ErrorType = ErrorType.BadRequest;
}
