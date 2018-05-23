export interface Event {
  eventType: string;
  aggregateId: string;
  sequence: number;
  payload?: {};
}
