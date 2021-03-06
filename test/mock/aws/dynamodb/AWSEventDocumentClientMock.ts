import { AWSError, DynamoDB } from "aws-sdk";
import {
  GetItemInput,
  PutItemInput,
  QueryInput,
  ScanInput,
  BatchWriteItemInput,
  GetItemOutput,
  PutItemOutput,
  QueryOutput,
  ScanOutput,
  BatchWriteItemOutput,
  DeleteItemInput
} from "aws-sdk/clients/dynamodb";

import { Event, EventKey } from "../../../../src/model/Event";

import { AWSDocumentClientMock, Callback } from "./AWSDocumentClientMock";
import { InMemoryEventStore } from "../../InMemoryEventStore";

export class AWSEventDocumentClientMock implements AWSDocumentClientMock {
  public static TABLE_NAME = "eventum-events-test";

  public canHandleGet(params: GetItemInput): boolean {
    return params.TableName === AWSEventDocumentClientMock.TABLE_NAME;
  }

  public handleGet(params: GetItemInput, callback: Callback): void {
    const eventKey = params.Key as EventKey;

    const event = InMemoryEventStore.getEvent(eventKey);

    callback(null, {
      Item: event
    });
  }

  public canHandlePut(params: PutItemInput): boolean {
    return params.TableName === AWSEventDocumentClientMock.TABLE_NAME;
  }

  public handlePut(params: PutItemInput, callback: Callback): void {
    const event = params.Item as any;

    InMemoryEventStore.putEvent(event);

    callback(null, {
      Item: event
    });
  }

  public canHandleDelete(params: DeleteItemInput): boolean {
    return params.TableName === AWSEventDocumentClientMock.TABLE_NAME;
  }

  public handleDelete(params: DeleteItemInput, callback: Callback): void {
    const eventKey = params.Key as EventKey;

    InMemoryEventStore.deleteEvent(eventKey);

    callback(null, {});
  }

  public canHandleQuery(params: QueryInput): boolean {
    return params.TableName === AWSEventDocumentClientMock.TABLE_NAME;
  }

  public handleQuery(params: QueryInput, callback: Callback): void {
    if (params.IndexName === "EventIdIndex") {
      const eventId = params.ExpressionAttributeValues[":eventId"] as string;
      const event = InMemoryEventStore.getEventById(eventId);
      callback(null, { Items: event ? [event] : undefined });
    } else if (
      params.KeyConditionExpression === "aggregateId = :aggregateId AND #sequence BETWEEN :fromSequence AND :toSequence"
    ) {
      // EventDynamoDBStore.getEvents()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"] as string;
      const fromSequence = params.ExpressionAttributeValues[":fromSequence"] as number;
      const toSequence = params.ExpressionAttributeValues[":toSequence"] as number;

      const events = InMemoryEventStore.getEvents(aggregateId, fromSequence, toSequence);

      callback(null, {
        Items: events
      });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId") {
      // EventDynamoDBStore.getLastEvent()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"] as string;

      const events = InMemoryEventStore.getEvents(aggregateId, 0, Number.MAX_SAFE_INTEGER, 1, true);

      callback(null, {
        Items: events
      });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId AND #sequence >= :sequence") {
      // EventDynamoDBStore.rollBackTo()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"] as string;
      const sequence = params.ExpressionAttributeValues[":sequence"] as number;

      const events = InMemoryEventStore.getEvents(aggregateId, sequence, Number.MAX_SAFE_INTEGER);

      callback(null, {
        Items: events
      });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId AND #sequence <= :sequence") {
      // EventDynamoDBStore.rollForwardTo()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"] as string;
      const sequence = params.ExpressionAttributeValues[":sequence"] as number;

      const events = InMemoryEventStore.getEvents(aggregateId, 0, sequence);

      callback(null, {
        Items: events
      });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId AND #sequence >= :fromSequence") {
      // EventDynamoDBStore.getLastSequence()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"] as string;
      const fromSequence = params.ExpressionAttributeValues[":fromSequence"] as number;

      const events = InMemoryEventStore.getEvents(aggregateId, fromSequence, Number.MAX_SAFE_INTEGER);

      callback(null, {
        Items: events
      });
    } else {
      callback(new AWSError(`Unrecognise request pattern to DocumentClient.query() for table ${params.TableName}`));
    }
  }

  public canHandleScan(params: ScanInput): boolean {
    return false;
  }

  public handleScan(params: ScanInput, callback: Callback): boolean {
    throw new Error("Method not implemented.");
  }

  public canHandleBatchWrite(params: BatchWriteItemInput): boolean {
    return params.RequestItems[AWSEventDocumentClientMock.TABLE_NAME] !== undefined;
  }

  public handleBatchWrite(params: BatchWriteItemInput, callback: Callback): void {
    const unprocessedItems = {};
    const requestItems: any[] = params.RequestItems[AWSEventDocumentClientMock.TABLE_NAME];

    // mimic failures in batch writing
    const failN = Math.ceil(requestItems.length / 10);
    const itemsToProcess = requestItems.slice(0, 10);
    const itemsToUnprocess = requestItems.slice(10);
    if (itemsToUnprocess.length > 0) {
      unprocessedItems[AWSEventDocumentClientMock.TABLE_NAME] = itemsToUnprocess;
    }

    itemsToProcess.forEach((requestItem) => {
      if (requestItem.PutRequest) {
        const item = requestItem.PutRequest.Item;

        InMemoryEventStore.putEvent(item as Event);
      } else if (requestItem.DeleteRequest) {
        const eventKey: EventKey = requestItem.DeleteRequest.Key;

        InMemoryEventStore.deleteEvent(eventKey);
      } else {
        console.warn("Ignored RequestItem " + requestItem);
      }
    });

    callback(null, {
      UnprocessedItems: Object.keys(unprocessedItems).length > 0 ? unprocessedItems : null
    });
  }
}
