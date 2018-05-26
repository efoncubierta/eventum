import { Event } from "../model/Event";
import { Snapshot } from "../model/Snapshot";
import { Journal } from "../model/Journal";

export type LambdaResponse =
  | LambdaGetEventResponse
  | LambdaGetJournalResponse
  | LambdaGetSnapshotResponse
  | LambdaErrorResponse;

export interface LambdaGetEventRequest {
  aggregateId: string;
  sequence: number;
}

export interface LambdaGetEventResponse {
  event: Event;
}

export interface LambdaGetJournalRequest {
  aggregateId: string;
}

export interface LambdaGetJournalResponse {
  journal: Journal;
}

export interface LambdaGetSnapshotRequest {
  aggregateId: string;
  sequence: number;
}

export interface LambdaGetSnapshotResponse {
  snapshot: Snapshot;
}

export interface LambdaSaveSnapshotRequest {
  aggregateId: string;
  sequence: number;
  payload: any;
}

export interface LambdaSaveEventsRequest {
  events: Event[];
}

export interface LambdaErrorResponse {
  message: string;
  data?: any;
}
