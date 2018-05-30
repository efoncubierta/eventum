import { DynamoDB } from "aws-sdk";
import { BatchWriteItemOutput, BatchWriteItemRequestMap } from "aws-sdk/clients/dynamodb";
import { EventStore, EventStoreBatchResponse } from "../EventStore";
import { DynamoDBStore } from "./DynamoDBStore";
import { Eventum } from "../../Eventum";
import { EventumAWSDynamoDBTable } from "../../config/EventumConfig";
import { Event } from "../../model/Event";

/**
 * Manage journals in a DynamoDB table.
 */
export class EventDynamoDBStore extends DynamoDBStore implements EventStore {
  private eventsTableConfig: EventumAWSDynamoDBTable;

  constructor() {
    super();
    this.eventsTableConfig = Eventum.config().aws.dynamodb.events;
  }

  public saveBatch(events: Event[]): Promise<EventStoreBatchResponse> {
    if (!events || events.length === 0) {
      return Promise.resolve({});
    }

    // Build the RequestItems request. One PutRequest per event
    const requestItems = {};
    requestItems[this.eventsTableConfig.tableName] = events.map((event) => {
      return {
        PutRequest: {
          Item: event
        }
      };
    });

    return this.retryBatchWrite(requestItems).then((response) => {
      return this.toEventStoreBatchResponse(events, response);
    });
  }

  public removeBatch(events: Event[]): Promise<EventStoreBatchResponse> {
    if (!events || events.length === 0) {
      return Promise.resolve({});
    }

    // Build the RequestItems request. One DeleteRequest per event
    const requestItems = {};
    requestItems[this.eventsTableConfig.tableName] = events.map((event) => {
      return {
        DeleteRequest: {
          Key: event
        }
      };
    });

    return this.retryBatchWrite(requestItems).then((response) => {
      return this.toEventStoreBatchResponse(events, response);
    });
  }

  public rollbackTo(aggregateId: string, sequence: number): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    /**
     * 1. Get all events to be rolled back.
     * 2. Build a RequestItem and call batchWrite.
     */
    return documentClient
      .query({
        TableName: this.eventsTableConfig.tableName,
        ProjectionExpression: "aggregateId, #sequence",
        KeyConditionExpression: "aggregateId = :aggregateId AND #sequence >= :sequence",
        ExpressionAttributeNames: {
          "#sequence": "sequence"
        },
        ExpressionAttributeValues: {
          ":aggregateId": aggregateId,
          ":sequence": sequence
        }
      })
      .promise()
      .then((result) => {
        const events = result.Items as Event[];

        // no further actions if there are no events to be deleted
        if (events.length === 0) {
          return null;
        }

        // Build the RequestItems request. One DeleteRequest per event
        const requestItems = {};
        requestItems[this.eventsTableConfig.tableName] = events.map((event) => {
          return {
            DeleteRequest: {
              Key: event
            }
          };
        });

        return this.retryBatchWrite(requestItems);
      })
      .then(() => {
        // TODO handle response?
        return null;
      });
  }

  public rollforwardTo(aggregateId: string, sequence: number): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    /**
     * 1. Get all events to be rolled forward.
     * 2. Build a RequestItem and call batchWrite.
     */
    return documentClient
      .query({
        TableName: this.eventsTableConfig.tableName,
        ProjectionExpression: "aggregateId, #sequence",
        KeyConditionExpression: "aggregateId = :aggregateId AND #sequence <= :sequence",
        ExpressionAttributeNames: {
          "#sequence": "sequence"
        },
        ExpressionAttributeValues: {
          ":aggregateId": aggregateId,
          ":sequence": sequence
        }
      })
      .promise()
      .then((result) => {
        const events = result.Items as Event[];
        // no further actions if there are no events to be deleted
        if (events.length === 0) {
          return;
        }

        // Build the RequestItems request. One DeleteRequest per event
        const requestItems = {};
        requestItems[this.eventsTableConfig.tableName] = events.map((event) => {
          return {
            DeleteRequest: {
              Key: event
            }
          };
        });

        return this.retryBatchWrite(requestItems);
      })
      .then(() => {
        // TODO handle response?
        return;
      });
  }

  public get(aggregateId: string, sequence: number): Promise<Event> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .get({
        TableName: this.eventsTableConfig.tableName,
        Key: {
          aggregateId,
          sequence
        }
      })
      .promise()
      .then((result) => {
        return result.Item as Event;
      });
  }

  public getLast(aggregateId: string): Promise<Event> {
    const documentClient = new DynamoDB.DocumentClient();

    /**
     * 1. Get one event by aggregateID in reverse order (ScanIndexForward = false)
     * 2. Return the event if found
     */
    return documentClient
      .query({
        TableName: this.eventsTableConfig.tableName,
        KeyConditionExpression: "aggregateId = :aggregateId",
        ExpressionAttributeValues: {
          ":aggregateId": aggregateId
        },
        ScanIndexForward: false,
        Limit: 1
      })
      .promise()
      .then((result) => {
        return result.Items.length > 0 ? (result.Items[0] as Event) : null;
      });
  }

  public getRange(
    aggregateId: string,
    fromSequence: number = 0,
    toSequence: number = Number.MAX_SAFE_INTEGER
  ): Promise<Event[]> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .query({
        TableName: this.eventsTableConfig.tableName,
        KeyConditionExpression: "aggregateId = :aggregateId AND #sequence BETWEEN :fromSequence AND :toSequence",
        ExpressionAttributeNames: {
          "#sequence": "sequence"
        },
        ExpressionAttributeValues: {
          ":aggregateId": aggregateId,
          ":fromSequence": fromSequence,
          ":toSequence": toSequence
        }
      })
      .promise()
      .then((result) => {
        return result.Items as Event[];
      });
  }

  private toEventStoreBatchResponse(
    events: Event[],
    response: BatchWriteItemRequestMap
  ): Promise<EventStoreBatchResponse> {
    if (response && response[this.eventsTableConfig.tableName]) {
      const failedKeys = response[this.eventsTableConfig.tableName].map((request) => {
        if (request.DeleteRequest) {
          return {
            aggregateId: request.DeleteRequest.Key.aggregateId.S,
            sequence: Number(request.DeleteRequest.Key.sequence.N)
          };
        } else if (request.PutRequest) {
          return {
            aggregateId: request.PutRequest.Item.aggregateId.S,
            sequence: Number(request.PutRequest.Item.sequence.N)
          };
        }
      });

      // TODO optimise these nested loops
      const failedItems: Event[] = events.filter((event) => {
        return failedKeys.find((keys) => keys.aggregateId === event.aggregateId && keys.sequence === event.sequence);
      });

      return Promise.reject({ failedItems });
    } else {
      return Promise.resolve({});
    }
  }
}
