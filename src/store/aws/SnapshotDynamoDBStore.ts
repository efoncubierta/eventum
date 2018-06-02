import { DynamoDB } from "aws-sdk";
import { SnapshotStore } from "../SnapshotStore";
import { DynamoDBStore } from "./DynamoDBStore";
import { Eventum } from "../../Eventum";
import { EventumAWSDynamoDBTable, EventumSnapshotConfig } from "../../config/EventumConfig";
import { Snapshot } from "../../model/Snapshot";
import { Nullable } from "../../typings/Nullable";
import { BatchWriteItemRequestMap } from "aws-sdk/clients/dynamodb";

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

  public get(aggregateId: string, sequence: number): Promise<Snapshot> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .get({
        TableName: this.snapshotsTableConfig.tableName,
        Key: {
          aggregateId,
          sequence
        }
      })
      .promise()
      .then((result) => {
        return result.Item as Snapshot;
      });
  }

  public getLatest(aggregateId: string): Promise<Nullable<Snapshot>> {
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
      .then((result) => {
        return result.Items && result.Items.length > 0 ? (result.Items[0] as Snapshot) : null;
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
      .then(() => {
        return;
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
      .then((result) => {
        return result.Items as Snapshot[];
      })
      .then((snapshots) => {
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
        const requestItems: BatchWriteItemRequestMap = {};
        requestItems[this.snapshotsTableConfig.tableName] = snapshots.map((event) => {
          return {
            DeleteRequest: {
              Key: DynamoDB.Converter.marshall({
                aggregateId: event.aggregateId,
                sequence: event.sequence
              })
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
