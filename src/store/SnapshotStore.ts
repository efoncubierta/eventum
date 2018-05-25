import { Snapshot } from "../model/Snapshot";

export interface SnapshotStore {
  /**
   * Get a snapshot.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Sequence
   */
  get(aggregateId: string, sequence: number): Promise<Snapshot>;

  /**
   * Get current snapshot.
   *
   * This action is executed asynchronously, returning a promise with a {@link Snapshot}. If there was a failure
   * getting the snapshot, the promise would be rejected. If there is no snapshot for the aggregate, null
   * will be returned.
   *
   * @param aggregateId Aggregate ID
   */
  getLatest(aggregateId: string): Promise<Snapshot>;

  /**
   * Save a snapshot.
   *
   * @param snapshot Snapshot
   */
  save(snapshot: Snapshot): Promise<void>;

  /**
   * Purge snapshots since the begining of time until an event sequence.
   *
   * This action is executed asynchronously, returning a promise. If there was a failure purging snapshots
   * to a certain point, the promise would be rejected.
   *
   * @param aggregateId Aggregate ID
   */
  purge(aggregateId: string): Promise<void>;
}
