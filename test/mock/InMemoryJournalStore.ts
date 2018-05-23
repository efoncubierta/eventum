import { Event } from "../../src/model/Event";

/**
 * Manage journal data in memory.
 */
export class InMemoryJournalStore {
  private static journals: Event[] = [];

  /**
   * Put an event in the in-memory journals array. This action replaces any existing
   * event for the same aggregate ID and sequence number.
   *
   * @param event Event
   */
  public static putEvent(event: Event): void {
    this.deleteEvent(event.aggregateId, event.sequence);
    this.journals.push(event);
  }

  /**
   * Delete an event from the in-memory journals array.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Sequence
   */
  public static deleteEvent(aggregateId: string, sequence: number): void {
    this.journals = this.journals.filter((e) => {
      return !(e.aggregateId === aggregateId && e.sequence === sequence);
    });
  }

  /**
   * Get an event from the in-memory journals array.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Sequence
   * @return Event object or null if it doesn't exist
   */
  public static getEvent(aggregateId: string, sequence: number): Event {
    return this.journals.find((event) => {
      return event.aggregateId === aggregateId && event.sequence === sequence;
    });
  }

  /**
   * Get a range of sorted events (lower sequence first).
   *
   * @param aggregateId Aggregate ID
   * @param fromSequence From sequence
   * @param toSequence To sequence
   * @param limit Limit the number of results
   * @param reverse Reverse the order of events (higher sequence first)
   * @returns Sequence of events sorted in ascending order by sequence or empty array if none are found
   */
  public static getEvents(
    aggregateId: string,
    fromSequence: number = 0,
    toSequence: number = Number.MAX_SAFE_INTEGER,
    limit: number = Number.MAX_SAFE_INTEGER,
    reverse: boolean = false
  ): Event[] {
    const events = this.journals
      .filter((event) => {
        return event.aggregateId === aggregateId && event.sequence >= fromSequence && event.sequence <= toSequence;
      })
      .sort((last, current) => last.sequence - current.sequence);

    if (reverse) {
      events.reverse();
    }

    return events.slice(0, limit);
  }
}
