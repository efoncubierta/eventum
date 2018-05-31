export interface Event {
  eventType: string;
  occurredAt: string;
  aggregateId: string;
  sequence: number;
  payload?: {};
}
