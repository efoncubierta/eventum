import { AggregateId } from "./Common";
import { Snapshot } from "./Snapshot";
import { Event } from "./Event";

export interface Journal {
  aggregateId: AggregateId;
  snapshot?: Snapshot;
  events: Event[];
}

export type JournalKey = Pick<Journal, "aggregateId">;
