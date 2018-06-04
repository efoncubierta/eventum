import { ResponseType } from "./ResponseType";

export interface SuccessResponse<T> {
  readonly type: ResponseType.OK;
  readonly payload?: T;
}
