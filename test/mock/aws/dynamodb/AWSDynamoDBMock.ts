import { AWSError } from "aws-sdk";
import * as AWS from "aws-sdk-mock";
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

import { Eventum } from "../../../../src/Eventum";
import { AWSDocumentClientMock, Callback } from "./AWSDocumentClientMock";
import { AWSEventDocumentClientMock } from "./AWSEventDocumentClientMock";
import { AWSSnapshotDocumentClientMock } from "./AWSSnapshotDocumentClientMock";

/**
 * Mock AWS DynamoDB API.
 */
export class AWSDynamoDBMock {
  private static eventDocumentClientMock: AWSDocumentClientMock = new AWSEventDocumentClientMock();
  private static snapshotDocumentClientMock: AWSDocumentClientMock = new AWSSnapshotDocumentClientMock();

  /**
   * Mock the DocumentClient.get call.
   *
   * @param params DocumentClient.get input parameters
   * @param callback Callback
   */
  private static documentClientGetMock(params: GetItemInput, callback: Callback): void {
    if (AWSDynamoDBMock.eventDocumentClientMock.canHandleGet(params)) {
      AWSDynamoDBMock.eventDocumentClientMock.handleGet(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandleGet(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handleGet(params, callback);
    } else {
      return callback(new AWSError("This DocumentClient.get() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.put() call.
   *
   * @param params DocumentClient.put() input parameters
   * @param callback Callback
   */
  private static documentClientPutMock(params: PutItemInput, callback: Callback): void {
    if (AWSDynamoDBMock.eventDocumentClientMock.canHandlePut(params)) {
      AWSDynamoDBMock.eventDocumentClientMock.handlePut(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandlePut(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handlePut(params, callback);
    } else {
      return callback(new AWSError("This DocumentClient.put() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.delete() call.
   *
   * @param params DocumentClient.delete() input parameters
   * @param callback Callback
   */
  private static documentClientDeleteMock(params: DeleteItemInput, callback: Callback): void {
    if (AWSDynamoDBMock.eventDocumentClientMock.canHandleDelete(params)) {
      AWSDynamoDBMock.eventDocumentClientMock.handleDelete(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandleDelete(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handleDelete(params, callback);
    } else {
      return callback(new AWSError("This DocumentClient.delete() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.query() call.
   *
   * @param params DocumentClient.query() input parameters
   * @param callback Callback
   */
  private static documentClientQueryMock(params: QueryInput, callback: Callback): void {
    if (AWSDynamoDBMock.eventDocumentClientMock.canHandleQuery(params)) {
      AWSDynamoDBMock.eventDocumentClientMock.handleQuery(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandleQuery(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handleQuery(params, callback);
    } else {
      return callback(new AWSError("This DocumentClient.query() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.scan() call.
   *
   * @param params DocumentClient.query() input parameters
   * @param callback Callback
   */
  private static documentClientScanMock(params: ScanInput, callback: Callback): void {
    if (AWSDynamoDBMock.eventDocumentClientMock.canHandleScan(params)) {
      AWSDynamoDBMock.eventDocumentClientMock.handleScan(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandleScan(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handleScan(params, callback);
    } else {
      return callback(new AWSError("This DocumentClient.scan() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.batchWrite() call.
   *
   * @param params DocumentClient.batchWrite() input parameters
   * @param callback Callback
   */
  private static documentClientBatchWriteMock(params: BatchWriteItemInput, callback: Callback): void {
    if (AWSDynamoDBMock.eventDocumentClientMock.canHandleBatchWrite(params)) {
      AWSDynamoDBMock.eventDocumentClientMock.handleBatchWrite(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandleBatchWrite(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handleBatchWrite(params, callback);
    } else {
      return callback(new AWSError("This DocumentClient.batchWrite() call hasn't been mocked."));
    }
  }

  /**
   * Enable the AWS mockup.
   */
  public static enableMock(): void {
    AWS.mock("DynamoDB.DocumentClient", "get", AWSDynamoDBMock.documentClientGetMock);
    AWS.mock("DynamoDB.DocumentClient", "put", AWSDynamoDBMock.documentClientPutMock);
    AWS.mock("DynamoDB.DocumentClient", "delete", AWSDynamoDBMock.documentClientDeleteMock);
    AWS.mock("DynamoDB.DocumentClient", "query", AWSDynamoDBMock.documentClientQueryMock);
    AWS.mock("DynamoDB.DocumentClient", "scan", AWSDynamoDBMock.documentClientScanMock);
    AWS.mock("DynamoDB.DocumentClient", "batchWrite", AWSDynamoDBMock.documentClientBatchWriteMock);

    Eventum.config({
      aws: {
        dynamodb: {
          events: {
            tableName: AWSEventDocumentClientMock.TABLE_NAME
          },
          snapshots: {
            tableName: AWSSnapshotDocumentClientMock.TABLE_NAME
          }
        }
      }
    });
  }

  /**
   * Restore AWS mockup back to normal.
   */
  public static restoreMock(): void {
    AWS.restore("DynamoDB.DocumentClient");

    // restore Eventum default configuration
    Eventum.resetConfig();
  }
}
