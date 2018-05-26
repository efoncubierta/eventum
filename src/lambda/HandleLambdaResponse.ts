import { LambdaErrorResponse, LambdaResponse } from "../message/LambdaMessages";

export type HttpLambdaCallback = (error, response) => void;

export class HandleLambdaResponse {
  public static readonly TYPE_SUCCESS = "Success";
  public static readonly TYPE_BAD_REQUEST = "BadRequest";
  public static readonly TYPE_NOT_FOUND = "NotFound";
  public static readonly TYPE_UNKNOWN = "Unknown";

  public static success(callback: HttpLambdaCallback, response: any) {
    callback(null, {
      $type: this.TYPE_SUCCESS,
      ...response
    });
  }

  public static badRequest(callback: HttpLambdaCallback, message: string) {
    this.error(callback, this.TYPE_BAD_REQUEST, message);
  }

  public static notFound(callback: HttpLambdaCallback, message: string) {
    this.error(callback, this.TYPE_NOT_FOUND, message);
  }

  public static unknown(callback: HttpLambdaCallback, message: string) {
    this.error(callback, this.TYPE_UNKNOWN, message);
  }

  public static error(callback: HttpLambdaCallback, type: string, message: string, data?: any) {
    callback(null, {
      $type: type,
      message,
      data
    } as LambdaErrorResponse);
  }
}
