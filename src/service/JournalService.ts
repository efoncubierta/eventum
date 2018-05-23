import { StoreFactory } from "../store/StoreFactory";
import { Event } from "../model/Event";
import { Snapshot } from "../model/Snapshot";
import { Journal, JournalBuilder } from "../model/Journal";

/**
 * A journal service to manage journal data from the user space.
 *
 * Journal data should be managed through this services, which will provide all the mechanisms for
 * validating the data, permissions, etc. before they are stored in the database. Also, the journal service
 * is provider agnostic.
 *
 * @since 0.1
 */
export class JournalService {
  /**
   * Create a snapshot for an aggregate for a particular sequence.
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
  public static createSnapshot(aggregateId: string, sequence: number, payload: {}): Promise<void> {
    return StoreFactory.getJournalStore()
      .getEvent(aggregateId, sequence)
      .then((event) => {
        // event must exist to create the snapshot
        if (!event) {
          throw new Error(`Event(${aggregateId}, ${sequence}) does not exist. An snapshot cannot be created from it.`);
        }

        // TODO validate

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
   * Get a full journal for an aggregate.
   *
   * This action will perform the following activities:
   * 1. Get the latest snapshot, if there is one.
   * 2. Get all the events since the latest snapshot or the begining.
   * 3. Build and return the journal.
   *
   * @param aggregateId Aggregate id
   */
  public static getJournal(aggregateId: string): Promise<Journal> {
    let journalBuilder = new JournalBuilder().aggregateId(aggregateId);

    return StoreFactory.getSnapshotStore()
      .getLatest(aggregateId)
      .then((snapshot) => {
        // update journal builder
        journalBuilder = journalBuilder.snapshot(snapshot);

        // fetch latest events
        const fromSequence = snapshot ? snapshot.sequence + 1 : 0;
        return StoreFactory.getJournalStore().getEvents(aggregateId, fromSequence);
      })
      .then((events) => {
        // update journal builder with the events and build the journal
        return journalBuilder.events(events).build();
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
    // TODO validate events

    return StoreFactory.getJournalStore()
      .saveEvents(events)
      .then((response) => {
        // TODO handle response
        return;
      })
      .catch((error) => {
        // TODO rollback
      });
  }
}
