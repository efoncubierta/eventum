import { StoreFactory } from "../store/StoreFactory";

// model
import { Event } from "../model/Event";
import { Snapshot } from "../model/Snapshot";
import { Journal, JournalBuilder } from "../model/Journal";
import { SchemaValidator } from "../validation/SchemaValidator";

/**
 * An aggregate service to manage aggregate data from the user space.
 *
 * Aggregate data (i.e. events, snapshots, etc.) should be managed through this services, which will provide all the
 * mechanisms for validating the data, permissions, etc. before they are stored in the database. Also, the journal
 * service is provider agnostic.
 */
export class AggregateService {
  /**
   * Get an event.
   *
   * @param aggregateId Aggregate id
   * @param sequence Sequence
   * @return Promise with an event, or null if not found
   */
  public static getEvent(aggregateId: string, sequence: number): Promise<Event> {
    return StoreFactory.getEventStore().get(aggregateId, sequence);
  }

  /**
   * Get a full journal for an aggregate.
   *
   * This action will perform the following activities:
   * 1. Get the latest snapshot, if there is one.
   * 2. Get all the events since the latest snapshot or the begining.
   * 3. Build and return the journal.
   *
   * @param aggregateId Aggregate id
   * @return Promise with a journal, or null if not found
   */
  public static getJournal(aggregateId: string): Promise<Journal> {
    let journalBuilder = new JournalBuilder().aggregateId(aggregateId);

    return StoreFactory.getSnapshotStore()
      .getLatest(aggregateId)
      .then((snapshot) => {
        // update journal builder
        journalBuilder = journalBuilder.snapshot(snapshot);

        // fetch events since last snapshot or the begining
        const fromSequence = snapshot ? snapshot.sequence + 1 : 0;
        return StoreFactory.getEventStore().getRange(aggregateId, fromSequence);
      })
      .then((events) => {
        // update journal builder with the events and build the journal
        const journal = journalBuilder.events(events).build();

        // only return the journal if there is at least one snapshot or one event
        return journal.snapshot || journal.events.length > 0 ? journal : null;
      });
  }

  /**
   * Get a snapshot.
   *
   * @param aggregateId Aggregate id
   * @param sequence Sequence
   * @return Promise with a snapshot, or null if not found
   */
  public static getSnapshot(aggregateId: string, sequence: number): Promise<Snapshot> {
    return StoreFactory.getSnapshotStore().get(aggregateId, sequence);
  }

  /**
   * Save a snapshot for an aggregate for a particular sequence.
   *
   * This action will perform the following activities:
   * 1. Check whether there is an event for the given aggregate and sequence. Throw an error if no event is found.
   * 2. Save snapshot in the store.
   * 3. Purge snapshots.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Sequence
   * @param payload Payload
   */
  public static saveSnapshot(aggregateId: string, sequence: number, payload: {}): Promise<void> {
    return StoreFactory.getEventStore()
      .get(aggregateId, sequence)
      .then((event) => {
        // event must exist to create the snapshot
        if (!event) {
          throw new Error(`Event(${aggregateId}, ${sequence}) does not exist. An snapshot cannot be created from it.`);
        }

        // TODO validate input

        const snapshot: Snapshot = {
          aggregateId,
          sequence,
          payload
        };

        // save new snapshot
        return StoreFactory.getSnapshotStore().save(snapshot);
      })
      .then(() => {
        // purge old snapshots
        return StoreFactory.getSnapshotStore().purge(aggregateId);
      });
  }

  /**
   * Save a sequence of events.
   *
   * This action will perform the following activities:
   * 1. Validate events.
   * 2. Save all events.
   * 3. Roll event back if any error is reported.
   *
   * @param events Events
   */
  public static saveEvents(events: Event[]): Promise<void> {
    // reject undefined list of events
    if (!events) {
      return Promise.reject(new Error(`(AggregateService) List of events cannot be undefined`));
    }

    // build a dictionary aggregateId -> Event[]
    const eventsDic = events
      .sort((eventA, eventB) => {
        return eventA.sequence - eventB.sequence;
      })
      .reduce((last, current) => {
        // all events must be valid according to the schema
        const result = SchemaValidator.validateEvent(current);
        if (result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }

        // add aggregateId entry to the dictionary, if doesn't exist already, and add the event to it
        last[current.aggregateId] = last[current.aggregateId] || [];
        last[current.aggregateId].push(current);

        return last;
      }, {});

    // for each aggregateId, get the last event stored and validate that new events are correlated to it
    const correlationValidationPromises = Object.keys(eventsDic).map((aggregateId) => {
      return StoreFactory.getEventStore()
        .getLast(aggregateId)
        .then((lastEvent) => {
          let nextSequence = lastEvent ? lastEvent.sequence + 1 : 1;

          for (let i = 0; i < eventsDic[aggregateId].length; i++, nextSequence++) {
            const event = eventsDic[aggregateId][i];
            if (event.sequence !== nextSequence) {
              return Promise.reject(
                new Error(
                  `Event(${aggregateId}, ${event.sequence}) is not correlated to the latest sequence ${nextSequence -
                    1}`
                )
              );
            }
          }
        });
    });

    return Promise.all(correlationValidationPromises)
      .then(() => {
        return StoreFactory.getEventStore().saveBatch(events);
      })
      .then((response) => {
        // TODO handle response
        return;
      });
  }
}
