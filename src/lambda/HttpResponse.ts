export type HttpBody = HttpOKBody | HttpErrorBody;

export type HttpOKBody = string | Buffer | Uint8Array;

export interface HttpErrorBody {
  message: string;
}

export interface HttpHeaders {
  [x: string]: string;
}

/**
 * Represents a HTTP response to the AWS API Gateway.
 */
export class HttpResponse {
  // HTTP codes
  public static readonly OK = 200;
  public static readonly BAD_REQUEST = 400;
  public static readonly FORBIDDEN = 403;
  public static readonly NOT_FOUND = 404;
  public static readonly INTERNAL_ERROR = 500;

  // response data
  public readonly statusCode: number;
  public readonly body: HttpBody;
  public readonly headers: HttpHeaders;

  /**
   * Constructor.
   *
   * @param statusCode HTTP status code
   * @param body Response body
   * @param headers HTTP headers
   */
  constructor(statusCode: number, body: HttpBody, headers: HttpHeaders) {
    this.statusCode = statusCode;
    this.body = body || "";
    this.headers = headers || {};
  }
}
