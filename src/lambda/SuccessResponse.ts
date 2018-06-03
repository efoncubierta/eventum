import { ResponseType } from "./ResponseType";

export class SuccessResponse<T> {
  public readonly type = ResponseType.OK;
  public readonly payload?: T;
}
