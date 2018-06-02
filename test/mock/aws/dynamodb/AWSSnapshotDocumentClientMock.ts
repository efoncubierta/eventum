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
  BatchWriteItemOutput
} from "aws-sdk/clients/dynamodb";

import { Snapshot } from "../../../../src/model/Snapshot";

import { AWSDocumentClientMock, Callback } from "./AWSDocumentClientMock";
import { InMemorySnapshotStore } from "../../InMemorySnapshotStore";

export class AWSSnapshotDocumentClientMock implements AWSDocumentClientMock {
  public static TABLE_NAME = "eventum-snapshot-test";

  public canHandleGet(params: GetItemInput): boolean {
    return params.TableName === AWSSnapshotDocumentClientMock.TABLE_NAME;
  }

  public handleGet(params: GetItemInput, callback: Callback): void {
    // SnapshotDynamoDBStore.get()
    const aggregateId: string = params.Key.aggregateId as string;
    const sequence: number = params.Key.sequence as number;

    const snapshot = InMemorySnapshotStore.getSnapshot(aggregateId, sequence);

    callback(null, {
      Item: snapshot
    });
  }

  public canHandlePut(params: PutItemInput): boolean {
    return params.TableName === AWSSnapshotDocumentClientMock.TABLE_NAME;
  }

  public handlePut(params: PutItemInput, callback: Callback): void {
    const snapshot = params.Item as Snapshot;
    InMemorySnapshotStore.putSnapshot(snapshot);
    callback(null, {});
  }

  public canHandleQuery(params: QueryInput): boolean {
    return params.TableName === AWSSnapshotDocumentClientMock.TABLE_NAME;
  }

  public handleQuery(params: QueryInput, callback: Callback): void {
    if (params.KeyConditionExpression === "aggregateId = :aggregateId" && params.Limit === 1) {
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
        const snapshot = DynamoDB.Converter.unmarshall(requestItem.PutRequest.Item);

        InMemorySnapshotStore.putSnapshot(snapshot as Snapshot);
      } else if (requestItem.DeleteRequest) {
        const aggregateId: string = requestItem.DeleteRequest.Key.aggregateId as string;
        const sequence: number = requestItem.DeleteRequest.Key.sequence as number;

        InMemorySnapshotStore.deleteSnapshot(aggregateId, sequence);
      } else {
        console.warn("Ignored RequestItem " + requestItem);
      }
    });

    callback(null, {
      UnprocessedItems: Object.keys(unprocessedItems).length > 0 ? unprocessedItems : null
    });
  }
}
