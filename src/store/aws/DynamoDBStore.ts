// external dependencies
import { DynamoDB } from "aws-sdk";
import { operation as retryOperation } from "retry";
import { BatchWriteItemRequestMap, BatchWriteItemOutput } from "aws-sdk/clients/dynamodb";

/**
 * Utility class for DynamoDB based stores.
 */
export abstract class DynamoDBStore {
  /**
   * Wraps a DocumentClient.batchWrite() within a retryOperation (retry Node.js module).
   *
   * @param requestItems Request items
   */
  protected retryBatchWrite(requestItems: BatchWriteItemRequestMap): Promise<BatchWriteItemRequestMap | undefined> {
    const documentClient = new DynamoDB.DocumentClient();

    // TODO make this configurable via Eventum.config()
    const operation = retryOperation({
      retries: 3,
      minTimeout: 200
    });

    // current unprocessed items. On each iteration, this variable is updated with
    // the result from the batchWrite() call
    let unprocessedItems = requestItems;

    return new Promise((resolve, reject) => {
      operation.attempt((current) => {
        documentClient.batchWrite(
          {
            RequestItems: unprocessedItems
          },
          (error, result) => {
            // internal error? then reject promise immediately and stop retry
            if (error) {
              return reject(error);
            }

            // are there unprocessed items? then attempt to retry
            if (
              result.UnprocessedItems &&
              Object.keys(result.UnprocessedItems).length > 0 &&
              operation.retry(new Error("Unprocessed items"))
            ) {
              // update list of unprocessed items
              unprocessedItems = result.UnprocessedItems;
              return;
            }

            // if retry is exausted, then return the unprocessed items
            resolve(result.UnprocessedItems);
          }
        );
      });
    });
  }
}
