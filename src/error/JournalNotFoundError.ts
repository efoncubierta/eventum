import { NotFoundError } from "./NotFoundError";

export class JournalNotFoundError extends NotFoundError {
  constructor(aggregateId: string) {
    super(`Journal(${aggregateId}) not found`);
  }
}
