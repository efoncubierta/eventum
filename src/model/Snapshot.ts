import { AggregateId, Sequence } from "./Common";

export type SnapshotId = string;
export type SnapshotPayload = any;

export interface Snapshot {
  snapshotId: SnapshotId;
  aggregateId: AggregateId;
  sequence: Sequence;
  payload: SnapshotPayload;
}

export type SnapshotKey = Pick<Snapshot, "aggregateId" | "sequence">;

export type SnapshotInput = Pick<Snapshot, "aggregateId" | "sequence" | "payload">;
