import { ErrorResponse } from "./ErrorResponse";
import { SuccessResponse } from "./SuccessResponse";

export type LambdaResponse<T> = SuccessResponse<T> | ErrorResponse;
