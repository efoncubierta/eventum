// FP dependencies
import { Option } from "fp-ts/lib/Option";

// Eventum models
import { Snapshot, SnapshotKey } from "../model/Snapshot";

/**
 * Manage snapshots in a data store.
 */
export interface SnapshotStore {
  /**
   * Get a snapshot.
   *
   * @param snapshotKey Snapshot key
   *
   * @returns Promise with an optional snapshot.
   */
  get(snapshotKey: SnapshotKey): Promise<Option<Snapshot>>;

  /**
   * Get the latest snapshot of an aggregate.
   *
   * @param aggregateId Aggregate ID
   *
   * @returns Promise with an optional snapshot.
   */
  getLatest(aggregateId: string): Promise<Option<Snapshot>>;

  /**
   * Save a snapshot.
   *
   * @param snapshot Snapshot
   *
   * @returns Promise that will be rejected if any error occurrs.
   */
  save(snapshot: Snapshot): Promise<void>;

  /**
   * Purge redundant aggregates.
   *
   * @param aggregateId Aggregate ID
   *
   * @return Promise that will be rejected if any error occurrs.
   */
  purge(aggregateId: string): Promise<void>;
}
