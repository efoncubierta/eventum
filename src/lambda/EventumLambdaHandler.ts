// external dependencies
import { Callback, Context, Handler } from "aws-lambda";

export type EventumLambdaHandler<Request, Response> = (request: Request) => Promise<Response>;
