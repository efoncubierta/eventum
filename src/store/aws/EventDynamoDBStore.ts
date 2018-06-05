// external dependencies
import { DynamoDB } from "aws-sdk";
import { BatchWriteItemOutput, BatchWriteItemRequestMap } from "aws-sdk/clients/dynamodb";
import { Option, some, none } from "fp-ts/lib/Option";

// Eventum configuration
import { Eventum } from "../../Eventum";
import { EventumAWSDynamoDBTable } from "../../config/EventumConfig";

// Eventum stores
import { EventStore, EventStoreBatchResponse } from "../EventStore";
import { DynamoDBStore } from "./DynamoDBStore";

// Eventum models
import { Event, EventKey, EventId } from "../../model/Event";

/**
 * Manage journals in a DynamoDB table.
 */
export class EventDynamoDBStore extends DynamoDBStore implements EventStore {
  private eventsTableConfig: EventumAWSDynamoDBTable;

  constructor() {
    super();
    this.eventsTableConfig = Eventum.config().aws.dynamodb.events;
  }

  public get(eventKey: EventKey): Promise<Option<Event>> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .get({
        TableName: this.eventsTableConfig.tableName,
        Key: eventKey
      })
      .promise()
      .then((dbResult) => {
        return dbResult.Item ? some(dbResult.Item as Event) : none;
      });
  }

  public getById(eventId: EventId): Promise<Option<Event>> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .query({
        TableName: this.eventsTableConfig.tableName,
        IndexName: "EventIdIndex",
        KeyConditionExpression: "eventId = :eventId",
        ExpressionAttributeValues: {
          ":eventId": eventId
        },
        Limit: 1
      })
      .promise()
      .then((result) => {
        return result.Items && result.Items.length > 0 ? some(result.Items[0] as Event) : none;
      });
  }

  public getLast(aggregateId: string): Promise<Option<Event>> {
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
      .then((dbResult) => {
        return dbResult.Items && dbResult.Items.length > 0 ? some(dbResult.Items[0] as Event) : none;
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
      .then((dbResult) => {
        return dbResult.Items as Event[];
      });
  }

  public save(event: Event): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .put({
        TableName: this.eventsTableConfig.tableName,
        Item: event
      })
      .promise()
      .then((dbResult) => {
        return;
      });
  }

  public saveBatch(events: Event[]): Promise<EventStoreBatchResponse> {
    if (!events || events.length === 0) {
      return Promise.resolve({});
    }

    // Build the RequestItems request. One PutRequest per event
    const requestItems: any = {};
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

  public remove(eventKey: EventKey): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .delete({
        TableName: this.eventsTableConfig.tableName,
        Key: eventKey
      })
      .promise()
      .then((dbResult) => {
        return;
      });
  }

  public removeById(eventId: EventId): Promise<void> {
    return this.getById(eventId).then((eventOpt) => {
      return eventOpt.foldL(
        () => Promise.resolve(),
        (event) => this.remove({ aggregateId: event.aggregateId, sequence: event.sequence })
      );
    });
  }

  public removeBatch(events: Event[]): Promise<EventStoreBatchResponse> {
    if (!events || events.length === 0) {
      return Promise.resolve({});
    }

    // Build the RequestItems request. One DeleteRequest per event
    const requestItems: any = {};
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

  public rollbackTo(eventKey: EventKey): Promise<void> {
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
          ":aggregateId": eventKey.aggregateId,
          ":sequence": eventKey.sequence
        }
      })
      .promise()
      .then((dbResult) => {
        const events = dbResult.Items as Event[];

        // no further actions if there are no events to be deleted
        if (events.length === 0) {
          return;
        }

        // Build the RequestItems request. One DeleteRequest per event
        const requestItems: any = {};
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

  public rollforwardTo(eventKey: EventKey): Promise<void> {
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
          ":aggregateId": eventKey.aggregateId,
          ":sequence": eventKey.sequence
        }
      })
      .promise()
      .then((dbResult) => {
        const events = dbResult.Items as Event[];

        // no further actions if there are no events to be deleted
        if (events.length === 0) {
          return;
        }

        // Build the RequestItems request. One DeleteRequest per event
        const requestItems: any = {};
        requestItems[this.eventsTableConfig.tableName] = events.map((event) => {
          return {
            DeleteRequest: {
              Key: event
            }
          };
        });

        return this.retryBatchWrite(requestItems);
      })
      .then((batchResponse) => {
        // TODO handle response?
        return;
      });
  }

  private toEventStoreBatchResponse(
    events: Event[],
    response: BatchWriteItemRequestMap | undefined
  ): Promise<EventStoreBatchResponse> {
    if (response && response[this.eventsTableConfig.tableName]) {
      // extract failed keys [{aggregateId, sequence}]
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
        } else {
          throw new Error(`Unknown request: ${request}`);
        }
      });

      // obtain list of succeded and failed items
      const succeededItems: Event[] = [];
      const failedItems: Event[] = [];
      events.forEach((event) => {
        const failedEvent = failedKeys.find(
          (keys) => keys.aggregateId === event.aggregateId && keys.sequence === event.sequence
        );

        if (failedEvent) {
          failedItems.push(event);
        } else {
          succeededItems.push(event);
        }
      });

      return Promise.reject({ failedItems, succeededItems });
    } else {
      return Promise.resolve({ succeededItems: events });
    }
  }
}
