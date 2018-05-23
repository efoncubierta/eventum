import { KinesisStream } from "./KinesisStream";
import { EventStream } from "../EventStream";
import { Event } from "../../model/Event";

export class EventKinesisStream extends KinesisStream implements EventStream {
  public publish(event: Event): Promise<void> {
    return Promise.resolve(null);
  }
}
