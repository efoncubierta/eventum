import { StoreFactory } from "../store/StoreFactory";

// typings
import { Nullable } from "../typings/Nullable";

// model
import { Event, EventInput } from "../model/Event";
import { Snapshot, SnapshotInput } from "../model/Snapshot";
import { Journal, JournalBuilder } from "../model/Journal";
import { AggregateId } from "../model/Common";

// validation
import { SchemaValidator } from "../validation/SchemaValidator";

interface EventRequestsDic {
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
   * @param aggregateId Aggregate id
   * @param sequence Sequence
   * @return Promise with an event, or null if not found
   */
  public static getEvent(aggregateId: string, sequence: number): Promise<Nullable<Event>> {
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
  public static getJournal(aggregateId: string): Promise<Nullable<Journal>> {
    let journalBuilder = new JournalBuilder().aggregateId(aggregateId);

    return StoreFactory.getSnapshotStore()
      .getLatest(aggregateId)
      .then((snapshot) => {
        // update journal builder
        if (snapshot) {
          journalBuilder = journalBuilder.snapshot(snapshot);
        }

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
  public static getSnapshot(aggregateId: string, sequence: number): Promise<Nullable<Snapshot>> {
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
   * @param snapshotInput Snapshot input
   */
  public static saveSnapshot(snapshotInput: SnapshotInput): Promise<void> {
    return StoreFactory.getEventStore()
      .get(snapshotInput.aggregateId, snapshotInput.sequence)
      .then((event) => {
        // event must exist to create the snapshot
        if (!event) {
          throw new Error(
            `Event(${snapshotInput.aggregateId}, ${
              snapshotInput.sequence
            }) does not exist. An snapshot cannot be created from it.`
          );
        }

        // TODO validate input

        const snapshot: Snapshot = {
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
    const eventRequestsDic: EventRequestsDic = eventInputs.reduce(
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
      {} as EventRequestsDic
    );

    // iterate over each aggregateId and correlate its events to the last one created
    // this operation resolves to Event[][]
    const correlatedEventsPromises = Object.keys(eventRequestsDic).map((aggregateId) => {
      return StoreFactory.getEventStore()
        .getLast(aggregateId)
        .then((lastEvent) => {
          let nextSequence = lastEvent ? lastEvent.sequence + 1 : 1;

          return eventRequestsDic[aggregateId].map((eventRequest) => {
            const now = new Date();
            return {
              eventType: eventRequest.eventType,
              occurredAt: now.toISOString(),
              aggregateId: eventRequest.aggregateId,
              sequence: nextSequence++,
              payload: eventRequest.payload
            } as Event;
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
      .then((response) => {
        // TODO handle response
        return response.successItems ? response.successItems : [];
      });
  }
}
