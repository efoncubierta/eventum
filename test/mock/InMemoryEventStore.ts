import { Event, EventKey, EventId } from "../../src/model/Event";

/**
 * Manage journal data in memory.
 */
export class InMemoryEventStore {
  private static events: Event[] = [];

  /**
   * Put an event in the in-memory journals array. This action replaces any existing
   * event for the same aggregate ID and sequence number.
   *
   * @param event Event
   */
  public static putEvent(event: Event): void {
    this.deleteEvent({
      aggregateId: event.aggregateId,
      sequence: event.sequence
    });
    this.events.push(event);
  }

  /**
   * Delete an event from the in-memory journals array.
   *
   * @param eventKey Event key
   */
  public static deleteEvent(eventKey: EventKey): void {
    this.events = this.events.filter((e) => {
      return !(e.aggregateId === eventKey.aggregateId && e.sequence === eventKey.sequence);
    });
  }

  /**
   * Delete an event from the in-memory journals array.
   *
   * @param eventId Event ID
   */
  public static deleteEventById(eventId: EventId): void {
    this.events = this.events.filter((e) => {
      return !(e.eventId === eventId);
    });
  }

  /**
   * Get an event from the in-memory journals array.
   *
   * @param eventKey Event key
   * @return Event object or null if it doesn't exist
   */
  public static getEvent(eventKey: EventKey): Event {
    return this.events.find((event) => {
      return event.aggregateId === eventKey.aggregateId && event.sequence === eventKey.sequence;
    });
  }

  /**
   * Get an event by its ID from the in-memory journals array.
   *
   * @param eventId Event unique ID
   * @return Event object or null if it doesn't exist
   */
  public static getEventById(eventId: EventId): Event {
    return this.events.find((event) => {
      return event.eventId === eventId;
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
    const events = this.events
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
