import { AggregateId, Sequence } from "./Common";

export type EventId = string;
export type EventType = string;
export type EventPayload = any;

export interface Event {
  eventId: EventId;
  eventType: EventType;
  source: string;
  authority: string;
  occurredAt: string;
  aggregateId: AggregateId;
  sequence: Sequence;
  payload?: EventPayload;
}

export type EventKey = Pick<Event, "aggregateId" | "sequence">;

export type EventInput = Pick<Event, "eventType" | "source" | "authority" | "aggregateId" | "payload">;
