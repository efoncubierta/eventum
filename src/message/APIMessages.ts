import { Event } from "../model/Event";

export interface APISaveSnapshotRequest {
  payload: any;
}

export interface APISaveEventsRequest {
  events: Event[];
}
