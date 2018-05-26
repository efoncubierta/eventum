import * as faker from "faker";
import { Event } from "../../src/model/Event";
import { Snapshot } from "../../src/model/Snapshot";
import {
  LambdaGetJournalRequest,
  LambdaGetEventRequest,
  LambdaGetSnapshotRequest,
  LambdaSaveSnapshotRequest,
  LambdaSaveEventsRequest
} from "../../src/message/LambdaMessages";

export class TestDataGenerator {
  public static randomEventType(): string {
    return faker.random.word().replace(" ", "");
  }

  public static randomAggregateId(): string {
    return faker.random.uuid();
  }

  public static randomSequence(): number {
    return faker.random.number(1000);
  }

  public static randomPayload(): any {
    return {
      prop1: faker.lorem.sentence(),
      prop2: faker.random.number()
    };
  }

  public static randomEvent(aggregateId?: string, sequence?: number): Event {
    return {
      eventType: this.randomEventType(),
      aggregateId: aggregateId || this.randomAggregateId(),
      sequence: sequence || this.randomSequence(),
      payload: this.randomPayload()
    };
  }

  public static randomEvents(size: number, aggregateId?: string, fromSequence?: number): Event[] {
    let seedSequence = fromSequence || 0;
    const events: Event[] = [];
    for (let i = 0; i < size; i++, seedSequence++) {
      events.push(this.randomEvent(aggregateId, seedSequence));
    }
    return events;
  }

  public static randomStateType(): string {
    return faker.random.word().replace(" ", "");
  }

  public static randomSnapshot(aggregateId?: string, sequence?: number): Snapshot {
    return {
      aggregateId: aggregateId || this.randomAggregateId(),
      sequence: sequence || this.randomSequence(),
      payload: this.randomPayload()
    };
  }

  public static randomSnapshots(size: number, aggregateId?: string, fromSequence?: number): Snapshot[] {
    let seedSequence = fromSequence || 0;
    const snapshots: Snapshot[] = [];
    for (let i = 0; i < size; i++, seedSequence++) {
      snapshots.push(this.randomSnapshot(aggregateId, seedSequence));
    }
    return snapshots;
  }

  public static randomLambdaGetJournalRequest(aggregateId?: string): LambdaGetJournalRequest {
    return {
      aggregateId: aggregateId || this.randomAggregateId()
    };
  }

  public static randomLambdaGetEventRequest(aggregateId?: string, sequence?: number): LambdaGetEventRequest {
    return {
      aggregateId: aggregateId || this.randomAggregateId(),
      sequence: sequence || this.randomSequence()
    };
  }

  public static randomLambdaGetSnapshotRequest(aggregateId?: string, sequence?: number): LambdaGetSnapshotRequest {
    return {
      aggregateId: aggregateId || this.randomAggregateId(),
      sequence: sequence || this.randomSequence()
    };
  }

  public static randomLambdaSaveSnapshotRequest(aggregateId?: string, sequence?: number): LambdaSaveSnapshotRequest {
    return {
      aggregateId: aggregateId || this.randomAggregateId(),
      sequence: sequence || this.randomSequence(),
      payload: this.randomPayload()
    };
  }

  public static randomLambdaSaveEventsRequest(
    size: number,
    aggregateId?: string,
    fromSequence?: number
  ): LambdaSaveEventsRequest {
    let seedSequence = fromSequence || 0;
    const events: Event[] = [];
    for (let i = 0; i < size; i++, seedSequence++) {
      events.push(this.randomEvent(aggregateId, seedSequence));
    }

    return {
      events
    };
  }
}
