import { Eventum } from "../Eventum";
import { EventumProvider } from "../config/EventumConfig";
import { JournalStore } from "./JournalStore";
import { SnapshotStore } from "./SnapshotStore";
import { JournalDynamoDBStore } from "./aws/JournalDynamoDBStore";
import { SnapshotDynamoDBStore } from "./aws/SnapshotDynamoDBStore";

/**
 * Create {@link JournalStore} and {@link SnapshotStore} instances for the Eventum provider
 * configured in {@link Eventum.config()}.
 */
export class StoreFactory {
  /**
   * Create a {@link JournalStore} instance for the provider configured.
   *
   * If there is no journal store for the provider configured, it will throw an exception.
   *
   * @returns Journal store
   */
  public static getJournalStore(): JournalStore {
    switch (Eventum.config().provider) {
      case EventumProvider.AWS:
        return new JournalDynamoDBStore();
      default:
        throw new Error(`JournalStore not available for ${Eventum.config().provider}`);
    }
  }

  /**
   * Create a {@link SnapshotStore} instance for the provider configured.
   *
   * If there is no snapshot store for the provider configured, it will throw an exception.
   *
   * @returns Snapshot store
   */
  public static getSnapshotStore(): SnapshotStore {
    switch (Eventum.config().provider) {
      case EventumProvider.AWS:
        return new SnapshotDynamoDBStore();
      default:
        throw new Error(`SnapshotStore not available for ${Eventum.config().provider}`);
    }
  }
}
