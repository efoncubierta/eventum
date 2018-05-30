import { AWSDocumentClientMock } from "./AWSDocumentClientMock";
import { InMemorySnapshotStore } from "../../InMemorySnapshotStore";

export class AWSSnapshotDocumentClientMock implements AWSDocumentClientMock {
  public static TABLE_NAME = "eventum-snapshot-test";

  public canHandleGet(params: any): boolean {
    return params.TableName === AWSSnapshotDocumentClientMock.TABLE_NAME;
  }

  public handleGet(params: any, callback: (error?: Error, response?: any) => void): void {
    // SnapshotDynamoDBStore.get()
    const aggregateId: string = params.Key.aggregateId;
    const sequence: number = params.Key.sequence;
    callback(null, {
      Item: InMemorySnapshotStore.getSnapshot(aggregateId, sequence)
    });
  }

  public canHandlePut(params: any): boolean {
    return params.TableName === AWSSnapshotDocumentClientMock.TABLE_NAME;
  }

  public handlePut(params: any, callback: (error?: Error, response?: any) => void): void {
    InMemorySnapshotStore.putSnapshot(params.Item);
    callback(null, {});
  }

  public canHandleQuery(params: any): boolean {
    return params.TableName === AWSSnapshotDocumentClientMock.TABLE_NAME;
  }

  public handleQuery(params: any, callback: (error?: Error, response?: any) => void): void {
    if (params.KeyConditionExpression === "aggregateId = :aggregateId" && params.Limit === 1) {
      // SnapshotDynamoDBStore.getLatest()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"];
      const snapshots = InMemorySnapshotStore.getSnapshots(aggregateId);
      callback(null, {
        Items: snapshots
      });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId") {
      // SnapshotDynamoDBStore.rollForwardTo()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"];
      const sequence = params.ExpressionAttributeValues[":sequence"];
      const snapshots = InMemorySnapshotStore.getSnapshots(aggregateId, 0, sequence, false);
      callback(null, {
        Items: snapshots
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
    return params.RequestItems[AWSSnapshotDocumentClientMock.TABLE_NAME];
  }

  public handleBatchWrite(params: any, callback: (error?: Error, response?: any) => void): void {
    const unprocessedItems = {};
    const requestItems: any[] = params.RequestItems[AWSSnapshotDocumentClientMock.TABLE_NAME];

    requestItems.forEach((requestItem) => {
      if (requestItem.PutRequest) {
        InMemorySnapshotStore.putSnapshot(requestItem.PutRequest.Item);
      } else if (requestItem.DeleteRequest) {
        InMemorySnapshotStore.deleteSnapshot(
          requestItem.DeleteRequest.Key.aggregateId,
          requestItem.DeleteRequest.Key.sequence
        );
      } else {
        unprocessedItems[AWSSnapshotDocumentClientMock.TABLE_NAME] =
          unprocessedItems[AWSSnapshotDocumentClientMock.TABLE_NAME] || [];
        unprocessedItems[AWSSnapshotDocumentClientMock.TABLE_NAME].push(requestItem);
      }
    });

    callback(null, {
      UnprocessedItems: Object.keys(unprocessedItems).length > 0 ? unprocessedItems : null
    });
  }
}
