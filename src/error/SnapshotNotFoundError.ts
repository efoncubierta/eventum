import { NotFoundError } from "./NotFoundError";
import { SnapshotKey } from "../model/Snapshot";

export class SnapshotNotFoundError extends NotFoundError {
  constructor(snapshotKey: SnapshotKey) {
    super(`Snapshot(${snapshotKey.aggregateId}, ${snapshotKey.sequence}) not found`);
  }
}
