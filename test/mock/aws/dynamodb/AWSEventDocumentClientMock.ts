import { AWSDocumentClientMock } from "./AWSDocumentClientMock";
import { InMemoryEventStore } from "../../InMemoryEventStore";

export class AWSEventDocumentClientMock implements AWSDocumentClientMock {
  public static TABLE_NAME = "eventum-events-test";

  public canHandleGet(params: any): boolean {
    return params.TableName === AWSEventDocumentClientMock.TABLE_NAME;
  }

  public handleGet(params: any, callback: (error?: Error, response?: any) => void): void {
    // EventDynamoDBStore.getEvent()
    const aggregateId: string = params.Key.aggregateId;
    const sequence: number = params.Key.sequence;
    callback(null, {
      Item: InMemoryEventStore.getEvent(aggregateId, sequence)
    });
  }

  public canHandlePut(params: any): boolean {
    return false;
  }

  public handlePut(params: any, callback: (error?: Error, response?: any) => void): void {
    throw new Error("Method not implemented.");
  }

  public canHandleQuery(params: any): boolean {
    return params.TableName === AWSEventDocumentClientMock.TABLE_NAME;
  }

  public handleQuery(params: any, callback: (error?: Error, response?: any) => void): void {
    if (
      params.KeyConditionExpression === "aggregateId = :aggregateId AND #sequence BETWEEN :fromSequence AND :toSequence"
    ) {
      // EventDynamoDBStore.getEvents()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"];
      const fromSequence = params.ExpressionAttributeValues[":fromSequence"];
      const toSequence = params.ExpressionAttributeValues[":toSequence"];
      callback(null, {
        Items: InMemoryEventStore.getEvents(aggregateId, fromSequence, toSequence)
      });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId") {
      // EventDynamoDBStore.getLastEvent()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"];
      callback(null, {
        Items: InMemoryEventStore.getEvents(aggregateId, 0, Number.MAX_SAFE_INTEGER, 1, true)
      });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId AND #sequence >= :sequence") {
      // EventDynamoDBStore.rollBackTo()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"];
      const sequence = params.ExpressionAttributeValues[":sequence"];
      callback(null, {
        Items: InMemoryEventStore.getEvents(aggregateId, sequence, Number.MAX_SAFE_INTEGER)
      });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId AND #sequence <= :sequence") {
      // EventDynamoDBStore.rollForwardTo()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"];
      const sequence = params.ExpressionAttributeValues[":sequence"];
      callback(null, {
        Items: InMemoryEventStore.getEvents(aggregateId, 0, sequence)
      });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId AND #sequence >= :fromSequence") {
      // EventDynamoDBStore.getLastSequence()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"];
      const fromSequence = params.ExpressionAttributeValues[":fromSequence"];
      callback(null, {
        Items: InMemoryEventStore.getEvents(aggregateId, fromSequence, Number.MAX_SAFE_INTEGER)
      });
    } else {
      callback(new Error(`Unrecognise request pattern to DocumentClient.query() for table ${params.TableName}`));
    }
  }

  public canHandleScan(params: any): boolean {
    return false;
  }

  public handleScan(params: any, callback: (error?: Error, response?: any) => void): boolean {
    throw new Error("Method not implemented.");
  }

  public canHandleBatchWrite(params: any): boolean {
    return params.RequestItems[AWSEventDocumentClientMock.TABLE_NAME];
  }

  public handleBatchWrite(params: any, callback: (error?: Error, response?: any) => void): void {
    const unprocessedItems = {};
    const requestItems: any[] = params.RequestItems[AWSEventDocumentClientMock.TABLE_NAME];

    requestItems.forEach((requestItem) => {
      if (requestItem.PutRequest) {
        InMemoryEventStore.putEvent(requestItem.PutRequest.Item);
      } else if (requestItem.DeleteRequest) {
        InMemoryEventStore.deleteEvent(
          requestItem.DeleteRequest.Key.aggregateId,
          requestItem.DeleteRequest.Key.sequence
        );
      } else {
        unprocessedItems[AWSEventDocumentClientMock.TABLE_NAME] =
          unprocessedItems[AWSEventDocumentClientMock.TABLE_NAME] || [];
        unprocessedItems[AWSEventDocumentClientMock.TABLE_NAME].push(requestItem);
      }
    });

    callback(null, {
      UnprocessedItems: Object.keys(unprocessedItems).length > 0 ? unprocessedItems : null
    });
  }
}
