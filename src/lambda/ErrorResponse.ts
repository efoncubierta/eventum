import { ResponseType } from "./ResponseType";
import { ErrorType } from "../error/ErrorType";

export interface ErrorResponse {
  readonly type: ResponseType.ERROR;
  readonly errorType: ErrorType;
  readonly message: string;
}
