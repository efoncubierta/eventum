import { LambdaError } from "./LambdaError";

export abstract class BadRequestError extends LambdaError {
  public static readonly TYPE: string = "BadRequest";

  constructor(msg: string) {
    super(BadRequestError.TYPE, msg);
  }
}
