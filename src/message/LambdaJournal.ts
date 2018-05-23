import { Event } from "../model/Event";

export interface JournalCreateSnapshotRequest {
  aggregateId: string;
  sequence: number;
  payload: any;
}

export interface JournalGetJournalRequest {
  aggregateId: string;
}

export interface JournalSaveEventsRequest {
  events: Event[];
}
