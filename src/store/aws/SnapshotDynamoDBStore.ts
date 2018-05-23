import { DynamoDB } from "aws-sdk";
import { SnapshotStore } from "../SnapshotStore";
import { DynamoDBStore } from "./DynamoDBStore";
import { Eventum } from "../../Eventum";
import { EventumAWSStoreDetails, EventumSnapshotConfig } from "../../config/EventumConfig";
import { Snapshot } from "../../model/Snapshot";

/**
 * Manage snapshots in a DynamoDB table.
 */
export class SnapshotDynamoDBStore extends DynamoDBStore implements SnapshotStore {
  private snapshotStoreConfig: EventumAWSStoreDetails;
  private snapshotConfig: EventumSnapshotConfig;

  constructor() {
    super();
    this.snapshotStoreConfig = Eventum.config().aws.store.snapshot;
    this.snapshotConfig = Eventum.config().snapshot;
  }

  public getLatest(aggregateId: string): Promise<Snapshot> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.query(
        {
          TableName: this.snapshotStoreConfig.tableName,
          KeyConditionExpression: "aggregateId = :aggregateId",
          ExpressionAttributeValues: {
            ":aggregateId": aggregateId
          },
          ScanIndexForward: false,
          Limit: 1
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Items.length > 0 ? (result.Items[0] as Snapshot) : null);
          }
        }
      );
    });
  }

  public save(snapshot: Snapshot): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.put(
        {
          TableName: this.snapshotStoreConfig.tableName,
          Item: snapshot
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  public purge(aggregateId: string): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.query(
        {
          TableName: this.snapshotStoreConfig.tableName,
          ProjectionExpression: "aggregateId, #sequence",
          KeyConditionExpression: "aggregateId = :aggregateId",
          ExpressionAttributeNames: {
            "#sequence": "sequence"
          },
          ExpressionAttributeValues: {
            ":aggregateId": aggregateId
          }
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Items as Snapshot[]);
          }
        }
      );
    }).then((snapshots: Snapshot[]) => {
      const delta = snapshots.length - this.snapshotConfig.retention.count;

      if (delta <= 0) {
        // no snapshots to be deleted
        return;
      }

      // filter out snapshots that don't need to be deleted
      snapshots = snapshots.slice(0, delta);

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
      const requestItems = {};
      requestItems[this.snapshotStoreConfig.tableName] = snapshots.map((event) => {
        return {
          DeleteRequest: {
            Key: {
              aggregateId: event.aggregateId,
              sequence: event.sequence
            }
          }
        };
      });

      return this.retryBatchWrite(requestItems).then((result) => {
        // ignore unprocessed items. They'll get deleted in the next iteration
        return null;
      });
    });
  }
}
