// external dependencies
import { DynamoDB } from "aws-sdk";
import { operation as retryOperation } from "retry";
import { BatchWriteItemRequestMap, BatchWriteItemOutput } from "aws-sdk/clients/dynamodb";

// typings
import { Nullable } from "../../typings/Nullable";

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
            if (error) {
              reject(error);
            } else if (result.UnprocessedItems && operation.retry(new Error("Unprocessed items"))) {
              // retry?
              // update list of unprocessed items
              unprocessedItems = result.UnprocessedItems;
              return unprocessedItems;
            } else {
              resolve(result.UnprocessedItems);
            }
          }
        );
      });
    });
  }
}
