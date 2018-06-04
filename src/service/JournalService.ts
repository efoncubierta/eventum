// External dependencies
import { Option, some, none } from "fp-ts/lib/Option";
import * as UUID from "uuid";

// Eventum stores
import { StoreFactory } from "../store/StoreFactory";

// Eventum models
import { Event, EventInput, EventKey } from "../model/Event";
import { Snapshot, SnapshotInput, SnapshotKey } from "../model/Snapshot";
import { Journal } from "../model/Journal";
import { AggregateId } from "../model/Common";

// Eventum validation
import { SchemaValidator } from "../validation/SchemaValidator";
import { EventNotFoundError } from "../error/EventNotFoundError";

interface EventInputsDic {
  [x: string]: EventInput[];
}

/**
 * An aggregate service to manage aggregate data from the user space.
 *
 * Aggregate data (i.e. events, snapshots, etc.) should be managed through this services, which will provide all the
 * mechanisms for validating the data, permissions, etc. before they are stored in the database. Also, the journal
 * service is provider agnostic.
 */
export class JournalService {
  /**
   * Get an event.
   *
   * @param eventKey Event key
   *
   * @return Promise with an event, or null if not found
   */
  public static getEvent(eventKey: EventKey): Promise<Option<Event>> {
    return StoreFactory.getEventStore().get(eventKey);
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
  public static getJournal(aggregateId: string): Promise<Option<Journal>> {
    return StoreFactory.getSnapshotStore()
      .getLatest(aggregateId)
      .then((snapshotOpt) => {
        // fetch events since last snapshot or the begining
        const fromSequence = snapshotOpt.fold(1, (s) => (s ? s.sequence + 1 : 1));
        return Promise.all([snapshotOpt, StoreFactory.getEventStore().getRange(aggregateId, fromSequence)]);
      })
      .then((results) => {
        const snapshotOpt = results[0]; // chained result
        const events = results[1]; // range of events

        // only return the journal if there is at least one snapshot or one event
        if (snapshotOpt.isSome() || events.length > 0) {
          const snapshot = snapshotOpt.fold(undefined, (s) => s);
          return some({
            aggregateId,
            snapshot,
            events
          });
        } else {
          return none;
        }
      });
  }

  /**
   * Get a snapshot.
   *
   * @param snapshotKey Snapshot key
   *
   * @return Promise with a snapshot, or null if not found
   */
  public static getSnapshot(snapshotKey: SnapshotKey): Promise<Option<Snapshot>> {
    return StoreFactory.getSnapshotStore().get(snapshotKey);
  }

  /**
   * Save a snapshot for an aggregate for a particular sequence.
   *
   * This action will perform the following activities:
   * 1. Check whether there is an event for the given aggregate and sequence. Throw an error if no event is found.
   * 2. Save snapshot in the store.
   * 3. Purge snapshots.
   *
   * @param snapshotInput Snapshot input
   */
  public static saveSnapshot(snapshotInput: SnapshotInput): Promise<void> {
    const eventKey: EventKey = {
      aggregateId: snapshotInput.aggregateId,
      sequence: snapshotInput.sequence
    };

    return StoreFactory.getEventStore()
      .get(eventKey)
      .then((eventOpt) => {
        // event must exist to create the snapshot
        if (eventOpt.isNone()) {
          throw new EventNotFoundError(eventKey);
        }

        // TODO validate input

        const snapshot: Snapshot = {
          snapshotId: UUID.v4(),
          aggregateId: snapshotInput.aggregateId,
          sequence: snapshotInput.sequence,
          payload: snapshotInput.payload
        };

        // save new snapshot
        return StoreFactory.getSnapshotStore().save(snapshot);
      })
      .then(() => {
        // purge old snapshots
        return StoreFactory.getSnapshotStore().purge(snapshotInput.aggregateId);
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
   * @param eventInputs Event inputs
   */
  public static saveEvents(eventInputs: EventInput[]): Promise<Event[]> {
    // reject undefined list of events
    if (!eventInputs) {
      return Promise.reject(new Error(`(JournalService) List of events cannot be undefined`));
    }

    // build a dictionary aggregateId -> Event[]
    const eventRequestsDic: EventInputsDic = eventInputs.reduce(
      (last, current) => {
        // all events must be valid according to the schema
        const result = SchemaValidator.validateEventInput(current);
        if (result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }

        // add aggregateId entry to the dictionary, if doesn't exist already, and add the event to it
        last[current.aggregateId] = last[current.aggregateId] || [];
        last[current.aggregateId].push(current);

        return last;
      },
      {} as EventInputsDic
    );

    // iterate over each aggregateId and correlate its events to the last one created
    // this operation resolves to Promise<Event[]>[]
    const correlatedEventsPromises: Array<Promise<Event[]>> = Object.keys(eventRequestsDic).map((aggregateId) => {
      return StoreFactory.getEventStore()
        .getLast(aggregateId)
        .then((lastEventOpt) => {
          let nextSequence = lastEventOpt.fold(1, (e) => e.sequence + 1);

          return eventRequestsDic[aggregateId].map((eventRequest) => {
            return {
              eventId: UUID.v4(),
              eventType: eventRequest.eventType,
              occurredAt: new Date().toISOString(),
              aggregateId: eventRequest.aggregateId,
              sequence: nextSequence++,
              payload: eventRequest.payload
            };
          });
        });
    });

    return Promise.all(correlatedEventsPromises)
      .then((listOfEvents) => {
        // flat the list of correlated Event[][] -> Event[]
        const events = listOfEvents.reduce((last, current) => {
          return last.concat(current);
        }, []);
        return StoreFactory.getEventStore().saveBatch(events);
      })
      .then((batchResponse) => {
        if (batchResponse.failedItems) {
          // TODO handle response. Rollback?
        }
        return batchResponse.succeededItems ? batchResponse.succeededItems : [];
      });
  }
}
