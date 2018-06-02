import { ErrorType } from "./ErrorType";

export class EventumError extends Error {
  public readonly errorType: ErrorType = ErrorType.Unknown;
}
