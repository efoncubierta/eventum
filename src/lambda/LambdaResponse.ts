import { ErrorType } from "../error/ErrorType";

export type SuccessResponseType = "OK";
export type ErrorResponseType = "ERROR";
export type ResponseType = SuccessResponseType | ErrorResponseType;

export type LambdaResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface SuccessResponse<T> {
  type: SuccessResponseType;
  payload?: T;
}

export interface ErrorResponse {
  type: ErrorResponseType;
  errorType: ErrorType;
  message: string;
}
