import { Eventum } from "../../Eventum";
import { KinesisStream } from "./KinesisStream";
import { EventStream } from "../EventStream";
import { Event } from "../../model/Event";
import { EventumAWSStreamConfig, EventumAWSStreamDetails } from "../../config/EventumConfig";
import { Kinesis } from "aws-sdk";

export class EventKinesisStream extends KinesisStream implements EventStream {
  private eventsStreamConfig: EventumAWSStreamDetails;

  constructor() {
    super();
    this.eventsStreamConfig = Eventum.config().aws.stream.event;
  }

  public publish(event: Event): Promise<void> {
    const kinesis = new Kinesis();

    return new Promise((resolve, reject) => {
      kinesis.putRecord(
        {
          StreamName: this.eventsStreamConfig.streamName,
          PartitionKey: event.aggregateId,
          Data: JSON.stringify(event)
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  public publishAll(events: Event[]): Promise<void> {
    const kinesis = new Kinesis();

    // map events to Kinesis records
    const records = events.map((event) => {
      return {
        PartitionKey: event.aggregateId,
        Data: JSON.stringify(event)
      };
    });

    return new Promise((resolve, reject) => {
      kinesis.putRecords(
        {
          StreamName: this.eventsStreamConfig.streamName,
          Records: records
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
}
