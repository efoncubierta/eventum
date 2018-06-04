import { NotFoundError } from "./NotFoundError";
import { EventKey } from "../model/Event";

export class EventNotFoundError extends NotFoundError {
  constructor(eventKey: EventKey) {
    super(`Event(${eventKey.aggregateId}, ${eventKey.sequence}) not found`);
  }
}
