import { DynamoDB } from "aws-sdk";
import { BatchWriteItemRequestMap, BatchWriteItemOutput } from "aws-sdk/clients/dynamodb";
import { operation as retryOperation } from "retry";

/**
 * Utility class for DynamoDB based stores.
 */
export abstract class DynamoDBStore {
  /**
   * Wraps a DocumentClient.batchWrite() within a retryOperation (retry Node.js module).
   *
   * @param requestItems Request items
   */
  protected retryBatchWrite(requestItems: BatchWriteItemRequestMap): Promise<BatchWriteItemRequestMap> {
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
            RequestItems: requestItems
          },
          (error, result) => {
            // retry?
            if (operation.retry(error)) {
              // update list of unprocessed items
              unprocessedItems = result ? result.UnprocessedItems || requestItems : requestItems;
              return;
            }

            if (error) {
              reject(error);
            } else {
              resolve(result.UnprocessedItems);
            }
          }
        );
      });
    });
  }
}
