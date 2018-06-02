import { Nullable } from "../typings/Nullable";
import { AggregateId, Sequence } from "./Common";

export type EventPayload = any;

export interface Event {
  eventType: string;
  occurredAt: string;
  aggregateId: AggregateId;
  sequence: Sequence;
  payload: Nullable<EventPayload>;
}

export type EventKey = Pick<Event, "aggregateId" | "sequence">;

export type EventInput = Pick<Event, "eventType" | "aggregateId" | "payload">;
