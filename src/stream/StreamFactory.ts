import { Eventum } from "../Eventum";
import { EventumProvider } from "../config/EventumConfig";
import { EventStream } from "./EventStream";
import { EventKinesisStream } from "./aws/EventKinesisStream";

/**
 * Create {@link EventStream} instances for the Eventum provider
 * configured in {@link Eventum.config()}.
 */
export class StreamFactory {
  /**
   * Create aa {@link EventStream} instance for the provider configured.
   *
   * If there is no event stream for the provider configured, it will throw an exception.
   *
   * @returns Event stream
   */
  public static getEventStream(): EventStream {
    switch (Eventum.config().provider) {
      case EventumProvider.AWS:
        return new EventKinesisStream();
      default:
        throw new Error(`EventStream not available for ${Eventum.config().provider}`);
    }
  }
}
