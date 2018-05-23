import { Event } from "../model/Event";

export interface EventStream {
  publish(event: Event): Promise<void>;
}