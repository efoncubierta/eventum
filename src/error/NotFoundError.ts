import { EventumError } from "./EventumError";
import { ErrorType } from "./ErrorType";

export abstract class NotFoundError extends EventumError {
  public readonly errorType: ErrorType = ErrorType.NotFound;
}
