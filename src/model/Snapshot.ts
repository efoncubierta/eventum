import { Nullable } from "../typings/Nullable";
import { AggregateId, Sequence } from "./Common";

export type SnapshotPayload = any;

export interface Snapshot {
  aggregateId: AggregateId;
  sequence: Sequence;
  payload: Nullable<SnapshotPayload>;
}

export type SnapshotKey = Pick<Snapshot, "aggregateId" | "sequence">;

export type SnapshotInput = Pick<Snapshot, "aggregateId" | "sequence" | "payload">;
