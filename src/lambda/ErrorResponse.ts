import { ResponseType } from "./ResponseType";
import { ErrorType } from "../error/ErrorType";

export class ErrorResponse {
  public readonly type = ResponseType.ERROR;
  public readonly errorType: ErrorType;
  public readonly message: string;
}
