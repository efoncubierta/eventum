import * as AWS from "aws-sdk-mock";
import { Eventum } from "../../../../src/Eventum";
import { AWSDocumentClientMock } from "./AWSDocumentClientMock";
import { AWSJournalDocumentClientMock } from "./AWSJournalDocumentClientMock";
import { AWSSnapshotDocumentClientMock } from "./AWSSnapshotDocumentClientMock";

/**
 * Mock AWS DynamoDB API.
 */
export class AWSDynamoDBMock {
  private static journalDocumentClientMock: AWSDocumentClientMock = new AWSJournalDocumentClientMock();
  private static snapshotDocumentClientMock: AWSDocumentClientMock = new AWSSnapshotDocumentClientMock();

  /**
   * Mock the DocumentClient.get call.
   *
   * @param params DocumentClient.get input parameters
   * @param callback Callback
   */
  private static documentClientGetMock(params, callback): void {
    if (AWSDynamoDBMock.journalDocumentClientMock.canHandleGet(params)) {
      AWSDynamoDBMock.journalDocumentClientMock.handleGet(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandleGet(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handleGet(params, callback);
    } else {
      return callback(new Error("This DocumentClient.get() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.put() call.
   *
   * @param params DocumentClient.put() input parameters
   * @param callback Callback
   */
  private static documentClientPutMock(params, callback): void {
    if (AWSDynamoDBMock.journalDocumentClientMock.canHandlePut(params)) {
      AWSDynamoDBMock.journalDocumentClientMock.handlePut(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandlePut(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handlePut(params, callback);
    } else {
      return callback(new Error("This DocumentClient.put() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.query() call.
   *
   * @param params DocumentClient.query() input parameters
   * @param callback Callback
   */
  private static documentClientQueryMock(params, callback): void {
    if (AWSDynamoDBMock.journalDocumentClientMock.canHandleQuery(params)) {
      AWSDynamoDBMock.journalDocumentClientMock.handleQuery(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandleQuery(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handleQuery(params, callback);
    } else {
      return callback(new Error("This DocumentClient.query() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.scan() call.
   *
   * @param params DocumentClient.query() input parameters
   * @param callback Callback
   */
  private static documentClientScanMock(params, callback): void {
    if (AWSDynamoDBMock.journalDocumentClientMock.canHandleScan(params)) {
      AWSDynamoDBMock.journalDocumentClientMock.handleScan(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandleScan(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handleScan(params, callback);
    } else {
      return callback(new Error("This DocumentClient.scan() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.batchWrite() call.
   *
   * @param params DocumentClient.batchWrite() input parameters
   * @param callback Callback
   */
  private static documentClientBatchWriteMock(params, callback): void {
    if (AWSDynamoDBMock.journalDocumentClientMock.canHandleBatchWrite(params)) {
      AWSDynamoDBMock.journalDocumentClientMock.handleBatchWrite(params, callback);
    } else if (AWSDynamoDBMock.snapshotDocumentClientMock.canHandleBatchWrite(params)) {
      AWSDynamoDBMock.snapshotDocumentClientMock.handleBatchWrite(params, callback);
    } else {
      return callback(new Error("This DocumentClient.batchWrite() call hasn't been mocked."));
    }
  }

  /**
   * Enable the AWS mockup.
   */
  public static enableMock(): void {
    AWS.mock("DynamoDB.DocumentClient", "get", AWSDynamoDBMock.documentClientGetMock);
    AWS.mock("DynamoDB.DocumentClient", "put", AWSDynamoDBMock.documentClientPutMock);
    AWS.mock("DynamoDB.DocumentClient", "query", AWSDynamoDBMock.documentClientQueryMock);
    AWS.mock("DynamoDB.DocumentClient", "scan", AWSDynamoDBMock.documentClientScanMock);
    AWS.mock("DynamoDB.DocumentClient", "batchWrite", AWSDynamoDBMock.documentClientBatchWriteMock);

    Eventum.config({
      aws: {
        store: {
          journal: {
            tableName: AWSJournalDocumentClientMock.TABLE_NAME
          },
          snapshot: {
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
    Eventum.config({});
  }
}