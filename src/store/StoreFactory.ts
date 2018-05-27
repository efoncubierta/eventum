import { Eventum } from "../Eventum";
import { EventumProvider } from "../config/EventumConfig";
import { EventStore } from "./EventStore";
import { SnapshotStore } from "./SnapshotStore";
import { EventDynamoDBStore } from "./aws/EventDynamoDBStore";
import { SnapshotDynamoDBStore } from "./aws/SnapshotDynamoDBStore";

/**
 * Create {@link EventStore} and {@link SnapshotStore} instances for the Eventum provider
 * configured in {@link Eventum.config()}.
 */
export class StoreFactory {
  /**
   * Create a {@link EventStore} instance for the provider configured.
   *
   * If there is no journal store for the provider configured, it will throw an exception.
   *
   * @returns Journal store
   */
  public static getEventStore(): EventStore {
    switch (Eventum.config().provider) {
      case EventumProvider.AWS:
        return new EventDynamoDBStore();
      default:
        throw new Error(`EventStore not available for ${Eventum.config().provider}`);
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
