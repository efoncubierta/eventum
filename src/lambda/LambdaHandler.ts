import { Either } from "fp-ts/lib/Either";
import { EventumError } from "../error/EventumError";

export type LambdaHandler<Request, Response> = (request: Request) => Promise<Either<EventumError, Response>>;
