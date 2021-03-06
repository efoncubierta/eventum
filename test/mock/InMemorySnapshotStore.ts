import { Snapshot, SnapshotKey, SnapshotId } from "../../src/model/Snapshot";

/**
 * Manage snapshot data in memory.
 */
export class InMemorySnapshotStore {
  private static snapshots: Snapshot[] = [];

  /**
   * Get a snapshot from the in-memory snapshots array.
   *
   * @param snapshotKey Snapshot key
   */
  public static getSnapshot(snapshotKey: SnapshotKey): Snapshot {
    return this.snapshots.find((snapshot) => {
      return snapshot.aggregateId === snapshotKey.aggregateId && snapshot.sequence === snapshotKey.sequence;
    });
  }

  /**
   * Get a snapshot from the in-memory snapshots array.
   *
   * @param snapshotId Snapshot ID
   */
  public static getSnapshotById(snapshotId: SnapshotId): Snapshot {
    return this.snapshots.find((snapshot) => {
      return snapshot.snapshotId === snapshotId;
    });
  }

  /**
   * Put a snapshot in the in-memory snapshots array. This action replace any existing
   * snapshot for the same aggregate ID and sequence number.
   *
   * @param snapshot Snapshot
   */
  public static putSnapshot(snapshot: Snapshot): void {
    this.deleteSnapshot({
      aggregateId: snapshot.aggregateId,
      sequence: snapshot.sequence
    });
    this.snapshots.push(snapshot);
  }

  /**
   * Delete an snapshot from the in-memory snapshots array.
   *
   * @param snapshotKey Snapshot key
   */
  public static deleteSnapshot(snapshotKey: SnapshotKey): void {
    this.snapshots = this.snapshots.filter((e) => {
      return !(e.aggregateId === snapshotKey.aggregateId && e.sequence === snapshotKey.sequence);
    });
  }

  /**
   * Delete an snapshot from the in-memory snapshots array.
   *
   * @param snapshotId Snapshot ID
   */
  public static deleteSnapshotByID(snapshotId: SnapshotId): void {
    this.snapshots = this.snapshots.filter((e) => {
      return !(e.snapshotId === snapshotId);
    });
  }

  /**
   * Get all snapshots for an aggregate sorted by sequence (lower sequence first).
   *
   * @param aggregateId Aggregate ID
   * @param reverse Reverse the order (higher sequence first)
   * @return Sequence of snapshots
   */
  public static getSnapshots(
    aggregateId: string,
    fromSequence: number = 0,
    toSequence: number = Number.MAX_SAFE_INTEGER,
    reverse: boolean = true
  ): Snapshot[] {
    const snapshots = this.snapshots
      .filter((snapshot) => {
        return (
          snapshot.aggregateId === aggregateId && snapshot.sequence >= fromSequence && snapshot.sequence <= toSequence
        );
      })
      .sort((last, current) => last.sequence - current.sequence);

    if (reverse) {
      snapshots.reverse();
    }

    return snapshots;
  }

  /**
   * Get list of snapshots to roll forward.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Sequence
   */
  public static getRollForwardSnapshots(aggregateId: string, sequence: number): Snapshot[] {
    return this.snapshots
      .filter((snapshot) => {
        return snapshot.aggregateId === aggregateId && snapshot.sequence <= sequence;
      })
      .sort((last, current) => last.sequence - current.sequence);
  }
}
