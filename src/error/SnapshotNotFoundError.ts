import { NotFoundError } from "./NotFoundError";

export class SnapshotNotFoundError extends NotFoundError {
  constructor(aggregateId: string, sequence: number) {
    super(`Snapshot(${aggregateId}, ${sequence}) not found`);
  }
}
