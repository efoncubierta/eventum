export abstract class LambdaError extends Error {
  public readonly errorType: string;

  constructor(errorType: string, msg: string) {
    super(msg);
    this.errorType = errorType;
  }
}
