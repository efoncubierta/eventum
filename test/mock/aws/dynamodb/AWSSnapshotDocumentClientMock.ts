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

import { Snapshot, SnapshotKey } from "../../../../src/model/Snapshot";

import { AWSDocumentClientMock, Callback } from "./AWSDocumentClientMock";
import { InMemorySnapshotStore } from "../../InMemorySnapshotStore";

export class AWSSnapshotDocumentClientMock implements AWSDocumentClientMock {
  public static TABLE_NAME = "eventum-snapshot-test";

  public canHandleGet(params: GetItemInput): boolean {
    return params.TableName === AWSSnapshotDocumentClientMock.TABLE_NAME;
  }

  public handleGet(params: GetItemInput, callback: Callback): void {
    // SnapshotDynamoDBStore.get()
    const snapshotKey = params.Key as SnapshotKey;

    const snapshot = InMemorySnapshotStore.getSnapshot(snapshotKey);

    callback(null, {
      Item: snapshot
    });
  }

  public canHandlePut(params: PutItemInput): boolean {
    return params.TableName === AWSSnapshotDocumentClientMock.TABLE_NAME;
  }

  public handlePut(params: PutItemInput, callback: Callback): void {
    // @ts-ignore
    const snapshot = params.Item as Snapshot;
    InMemorySnapshotStore.putSnapshot(snapshot);
    callback(null, {});
  }

  public canHandleDelete(params: DeleteItemInput): boolean {
    return params.TableName === AWSSnapshotDocumentClientMock.TABLE_NAME;
  }

  public handleDelete(params: DeleteItemInput, callback: Callback): void {
    const snapshotKey = params.Key as SnapshotKey;

    InMemorySnapshotStore.deleteSnapshot(snapshotKey);

    callback(null, {});
  }

  public canHandleQuery(params: QueryInput): boolean {
    return params.TableName === AWSSnapshotDocumentClientMock.TABLE_NAME;
  }

  public handleQuery(params: QueryInput, callback: Callback): void {
    if (params.IndexName === "SnapshotIdIndex") {
      const snapshotId = params.ExpressionAttributeValues[":snapshotId"] as string;
      const snapshot = InMemorySnapshotStore.getSnapshotById(snapshotId);
      callback(null, { Items: snapshot ? [snapshot] : undefined });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId" && params.Limit === 1) {
      // SnapshotDynamoDBStore.getLatest()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"] as string;

      const snapshots = InMemorySnapshotStore.getSnapshots(aggregateId);

      callback(null, {
        Items: snapshots
      });
    } else if (params.KeyConditionExpression === "aggregateId = :aggregateId") {
      // SnapshotDynamoDBStore.rollForwardTo()
      const aggregateId = params.ExpressionAttributeValues[":aggregateId"] as string;
      const sequence = params.ExpressionAttributeValues[":sequence"] as number;

      const snapshots = InMemorySnapshotStore.getSnapshots(aggregateId, 0, sequence, false);

      callback(null, {
        Items: snapshots
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
    return params.RequestItems[AWSSnapshotDocumentClientMock.TABLE_NAME] !== undefined;
  }

  public handleBatchWrite(params: BatchWriteItemInput, callback: Callback): void {
    const unprocessedItems = {};
    const requestItems: any[] = params.RequestItems[AWSSnapshotDocumentClientMock.TABLE_NAME];

    requestItems.forEach((requestItem) => {
      if (requestItem.PutRequest) {
        const snapshot = requestItem.PutRequest.Item as Snapshot;

        InMemorySnapshotStore.putSnapshot(snapshot);
      } else if (requestItem.DeleteRequest) {
        const snapshotKey: SnapshotKey = requestItem.DeleteRequest.Key;

        InMemorySnapshotStore.deleteSnapshot(snapshotKey);
      } else {
        console.warn("Ignored RequestItem " + requestItem);
      }
    });

    callback(null, {
      UnprocessedItems: Object.keys(unprocessedItems).length > 0 ? unprocessedItems : null
    });
  }
}
