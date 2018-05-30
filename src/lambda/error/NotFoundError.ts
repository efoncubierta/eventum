import { LambdaError } from "./LambdaError";

export abstract class NotFoundError extends LambdaError {
  public static readonly TYPE: string = "NotFound";

  constructor(msg: string) {
    super(NotFoundError.TYPE, msg);
  }
}
