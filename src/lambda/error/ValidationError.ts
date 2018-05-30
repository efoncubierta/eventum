import { BadRequestError } from "./BadRequestError";

export class ValidationError extends BadRequestError {
  constructor(msg: string) {
    super(msg);
  }
}
