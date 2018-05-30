import { NotFoundError } from "./NotFoundError";

export class EventNotFoundError extends NotFoundError {
  constructor(aggregateId: string, sequence: number) {
    super(`Event(${aggregateId}, ${sequence}) not found`);
  }
}
