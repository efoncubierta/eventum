import { Nullable } from "../typings/Nullable";
import { Snapshot } from "./Snapshot";
import { Event } from "./Event";
import { AggregateId } from "./Common";

export interface Journal {
  aggregateId: AggregateId;
  snapshot: Nullable<Snapshot>;
  events: Event[];
}

export type JournalKey = Pick<Journal, "aggregateId">;

export class JournalBuilder {
  private j: Journal;

  constructor(journal?: Journal) {
    this.j = journal ? journal : ({} as Journal);
  }

  public aggregateId(aggregateId: string): JournalBuilder {
    this.j.aggregateId = aggregateId;
    return this;
  }

  public snapshot(snapshot: Snapshot): JournalBuilder {
    this.j.snapshot = snapshot;
    return this;
  }

  public events(events: Event[]): JournalBuilder {
    this.j.events = events;
    return this;
  }

  public build(): Journal {
    return this.j;
  }
}
