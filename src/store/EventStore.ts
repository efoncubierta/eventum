// FP dependencies
import { Option } from "fp-ts/lib/Option";

// Eventum models
import { Event, EventKey } from "../model/Event";

export interface StoreBatchResponse<T> {
  succeededItems?: T[];
  failedItems?: T[];
}

export type EventStoreBatchResponse = StoreBatchResponse<Event>;

/**
 * Manage events in a data store.
 */
export interface EventStore {
  /**
   * Save a batch of events.
   *
   * Depending on the data store, it is possible to store all the events within the same transaction. However,
   * that won't be possible in some other data stores. This method assumes the worst case i.e. an atomic transaction
   * for each event. Although leaves the single transaction option open to the event store implementor. The reason
   * to save events in batches is due to some performance optimisations in some data stores when saving in batches.
   *
   * Assuming an atomic transaction for each event, each transaction can run in parallel. It really doesn't
   * matter as long as each one of the events has a sequence number, which will be used to sort and replay the chain of
   * events.
   *
   * Events don't need to be validated, that's {@link JournalService}'s job. The store must be as faster as it can be.
   *
   * @param events Array of events
   *
   * @returns Promise with the batch summary details. A rejected promise can potentially leave the store in an
   * inconsistent state when the data store saves each event in its own atomic transaction. It is up the caller
   * how to manage the error.
   */
  saveBatch(events: Event[]): Promise<EventStoreBatchResponse>;

  /**
   * Remove a batch of events.
   *
   * As in {@link saveEvents}, depending on the data store, it is possible to remove all events within the same
   * transaction. But the worst case scenario (i.e. an atomic transaction for each event) is assumed here. It is
   * up to the implementor to do a full transaction.
   *
   * Each atomic transaction can run in parallel. It really doesn't matter as the events don't depend on each other.
   *
   * Events don't need to be validated, that's {@link JournalService}'s job. The store must be as faster as it can be.
   *
   * @param events Array of events
   *
   * @returns Promise with the batch summary details. A rejected promise can potentially leave the store in an
   * inconsistent state when the data store saves each event in its own atomic transaction. It is up the caller
   * how to manage the error.
   */
  removeBatch(events: Event[]): Promise<EventStoreBatchResponse>;

  /**
   * Roll events back to a certain sequence.
   *
   * Events with a higher sequence number than the given sequence number are deleted forever. Range [sequence, last]
   *
   * @param eventKey Event key
   *
   * @returns Promise that will be rejected if an error happens during the rollback process.
   */
  rollbackTo(eventKey: EventKey): Promise<void>;

  /**
   * Roll events forward to a specific event.
   *
   * Events with a lower sequence number than the given sequence number are deleted forever. Range [first, sequence]
   *
   * @param eventKey Event key
   *
   * @returns Promise that will be rejected if an error happens during the roll-forward process.
   */
  rollforwardTo(eventKey: EventKey): Promise<void>;

  /**
   * Get an event.
   *
   * @param eventKey Event key
   *
   * @return Promise that will resolve to an optional event.
   */
  get(eventKey: EventKey): Promise<Option<Event>>;

  /**
   * Get the last event for a particular aggregate.
   *
   * @param aggregateId Aggregate ID
   *
   * @return Promise that will resolve to an optional event.
   */
  getLast(aggregateId: string): Promise<Option<Event>>;

  /**
   * Get a range of events for a particular aggregate.
   *
   * @param aggregateId Aggregate ID
   * @param fromSequence Start sequence number. Default is 0
   * @param toSequence End sequence number. Default is Number.MAX_SAFE_INTEGER
   *
   * @return Promise that will resolve to a list of events. An empty list will be returned if no
   * events are found.
   */
  getRange(aggregateId: string, fromSequence?: number, toSequence?: number): Promise<Event[]>;
}
