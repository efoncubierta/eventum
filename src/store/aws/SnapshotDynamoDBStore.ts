// External dependencies
import { DynamoDB } from "aws-sdk";
import { BatchWriteItemRequestMap } from "aws-sdk/clients/dynamodb";
import { Option, some, none } from "fp-ts/lib/Option";

// Eventum configuration
import { Eventum } from "../../Eventum";
import { EventumAWSDynamoDBTable, EventumSnapshotConfig } from "../../config/EventumConfig";

// Eventum stores
import { DynamoDBStore } from "./DynamoDBStore";
import { SnapshotStore } from "../SnapshotStore";

// Eventum models
import { Snapshot, SnapshotKey, SnapshotId } from "../../model/Snapshot";

/**
 * Manage snapshots in a DynamoDB table.
 */
export class SnapshotDynamoDBStore extends DynamoDBStore implements SnapshotStore {
  private snapshotsTableConfig: EventumAWSDynamoDBTable;
  private snapshotConfig: EventumSnapshotConfig;

  constructor() {
    super();
    this.snapshotsTableConfig = Eventum.config().aws.dynamodb.snapshots;
    this.snapshotConfig = Eventum.config().snapshot;
  }

  public get(snapshotKey: SnapshotKey): Promise<Option<Snapshot>> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .get({
        TableName: this.snapshotsTableConfig.tableName,
        Key: snapshotKey
      })
      .promise()
      .then((dbResult) => {
        return dbResult.Item ? some(dbResult.Item as Snapshot) : none;
      });
  }

  public getById(snapshotId: SnapshotId): Promise<Option<Snapshot>> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .query({
        TableName: this.snapshotsTableConfig.tableName,
        IndexName: "SnapshotIdIndex",
        KeyConditionExpression: "snapshotId = :snapshotId",
        ExpressionAttributeValues: {
          ":snapshotId": snapshotId
        },
        Limit: 1
      })
      .promise()
      .then((result) => {
        return result.Items && result.Items.length > 0 ? some(result.Items[0] as Snapshot) : none;
      });
  }

  public getLatest(aggregateId: string): Promise<Option<Snapshot>> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .query({
        TableName: this.snapshotsTableConfig.tableName,
        KeyConditionExpression: "aggregateId = :aggregateId",
        ExpressionAttributeValues: {
          ":aggregateId": aggregateId
        },
        ScanIndexForward: false,
        Limit: 1
      })
      .promise()
      .then((dbResult) => {
        return dbResult.Items && dbResult.Items.length > 0 ? some(dbResult.Items[0] as Snapshot) : none;
      });
  }

  public save(snapshot: Snapshot): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .put({
        TableName: this.snapshotsTableConfig.tableName,
        Item: snapshot
      })
      .promise()
      .then((dbResult) => {
        return;
      });
  }

  public remove(snapshotKey: SnapshotKey): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .delete({
        TableName: this.snapshotsTableConfig.tableName,
        Key: snapshotKey
      })
      .promise()
      .then((dbResult) => {
        return;
      });
  }

  public removeById(snapshotId: SnapshotId): Promise<void> {
    return this.getById(snapshotId).then((snapshotOpt) => {
      return snapshotOpt.foldL(
        () => Promise.resolve(),
        (snapshot) => this.remove({ aggregateId: snapshot.aggregateId, sequence: snapshot.sequence })
      );
    });
  }

  public purge(aggregateId: string): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .query({
        TableName: this.snapshotsTableConfig.tableName,
        ProjectionExpression: "aggregateId, #sequence",
        KeyConditionExpression: "aggregateId = :aggregateId",
        ExpressionAttributeNames: {
          "#sequence": "sequence"
        },
        ExpressionAttributeValues: {
          ":aggregateId": aggregateId
        }
      })
      .promise()
      .then((dbResult) => {
        const allSnapshots = dbResult.Items as Snapshot[];
        const delta = allSnapshots.length - this.snapshotConfig.retention.count;

        if (delta <= 0) {
          // no snapshots to be deleted
          return;
        }

        // filter out snapshots that don't need to be deleted
        const snapshots = allSnapshots.slice(0, delta);

        /*
        * Build the following data structure:
        *
        * RequestItems: {
        *   TABLE_NAME: [{
        *     DeleteRequest: {
        *       Key: {
        *         aggregateId: AGGREGATE_ID_1,
        *         sequence: SEQUENCE_N_1
        *       }
        *     }
        *   }, {
        *     DeleteRequest: {
        *       Key: {
        *         aggregateId: AGGREGATE_ID_2,
        *         sequence: SEQUENCE_N_2
        *       }
        *     }
        *   }]
        * }
        */
        const requestItems: BatchWriteItemRequestMap = {};
        // @ts-ignore
        requestItems[this.snapshotsTableConfig.tableName] = snapshots.map((snapshot) => {
          return {
            DeleteRequest: {
              Key: {
                aggregateId: snapshot.aggregateId,
                sequence: snapshot.sequence
              }
            }
          };
        });

        return this.retryBatchWrite(requestItems).then((result) => {
          // ignore unprocessed items. They'll get deleted in the next iteration
          return;
        });
      });
  }
}
