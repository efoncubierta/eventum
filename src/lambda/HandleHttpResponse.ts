import { HttpResponse, HttpBody, HttpHeaders, HttpErrorBody, HttpOKBody } from "./HttpResponse";

export type HttpLambdaCallback = (error, response: HttpResponse) => void;

export class HandleHttpResponse {
  public static ok(callback: HttpLambdaCallback, body: HttpOKBody, headers?: HttpHeaders) {
    const response = new HttpResponse(HttpResponse.OK, body, headers);
    callback(null, response);
  }

  public static badRequest(callback: HttpLambdaCallback, body: HttpErrorBody, headers?: HttpHeaders) {
    const response = new HttpResponse(HttpResponse.BAD_REQUEST, body, headers);
    callback(null, response);
  }

  public static forbidden(callback: HttpLambdaCallback, body: HttpErrorBody, headers?: HttpHeaders) {
    const response = new HttpResponse(HttpResponse.FORBIDDEN, body, headers);
    callback(null, response);
  }

  public static notFound(callback: HttpLambdaCallback, body: HttpErrorBody, headers?: HttpHeaders) {
    const response = new HttpResponse(HttpResponse.NOT_FOUND, body, headers);
    callback(null, response);
  }

  public static internalError(callback: HttpLambdaCallback, body: HttpErrorBody, headers?: HttpHeaders) {
    const response = new HttpResponse(HttpResponse.INTERNAL_ERROR, body, headers);
    callback(null, response);
  }
}
