import { Event } from "../model/Event";

export interface StoreBatchResponse<T> {
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
   * This action is executed asynchronously, returning a promise with a {@link EventStoreBatchResponse}. If there were
   * failures saving one of the events, the promise would be rejected. It will only resolve when all the events in the
   * batch have been successfuly saved. Any other general failure will also reject the promise
   * i.e. DB connectivity issues.
   *
   * A rejected promise can potentially leave the store in an inconsistent state when the data store saves each event
   * in its own atomic transaction. It is up the caller how to manage the error.
   *
   * @param events Array of events
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
   * This action is executed asynchronously, returning a promise with a {@link EventStoreBatchResponse}. If there
   * were failures removing one of the events, the promise would be rejected. It will only resolve when all the events
   * in the batch have been successfully saved. Any other general failure will also reject the promise
   * i.e. DB connectivity issues.
   *
   * A rejected promise can potentially leave the store in an inconsisten state when the  data store saves each
   * event in its own transaction. It is up to the caller how to manage the error.
   *
   * @param events Events
   */
  removeBatch(events: Event[]): Promise<EventStoreBatchResponse>;

  /**
   * Roll events back to a certain sequence.
   *
   * Events with a higher sequence number than the given sequence number are deleted forever. Range [sequence, last]
   *
   * This action is executed asynchronously, returning a promise.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Least sequence number to be included (i.e. range [sequence, last])
   */
  rollbackTo(aggregateId: string, sequence: number): Promise<void>;

  /**
   * Roll events forward to a certian sequence.
   *
   * Events with a lower sequence number than the given sequence number are deleted forever. Range [first, sequence]
   *
   * This action is executed asynchronously, returning a promise.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Last sequence number to be included
   */
  rollforwardTo(aggregateId: string, sequence: number): Promise<void>;

  /**
   * Get an event.
   *
   * This action is executed asynchronously, returning a promise with {@link Event}. If no event is found,
   * null would be returned.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Sequence
   */
  get(aggregateId: string, sequence: number): Promise<Event>;

  /**
   * Get the last event for a particular aggregate.
   *
   * This action is executed asynchronously, returning a promise with an {@link Event}. If there are no events
   * for that aggregate, it'll return null.
   *
   * @param aggregateId Aggregate ID
   */
  getLast(aggregateId: string): Promise<Event>;

  /**
   * Get a range of events for a particular aggregate.
   *
   * This action is executed asynchronously, returning a promise with {@link Event[]}. If no events were found,
   * and empty array would be returned.
   *
   * @param aggregateId Aggregate ID
   * @param fromSequence Start sequence number. Default is 0
   * @param toSequence End sequence number. Default is Number.MAX_SAFE_INTEGER
   */
  getRange(aggregateId: string, fromSequence?: number, toSequence?: number): Promise<Event[]>;
}
