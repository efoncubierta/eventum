import { AWSError } from "aws-sdk";
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

export type Callback = (err: AWSError | null, data?: any) => void;

export interface AWSDocumentClientMock {
  canHandleGet(params: GetItemInput): boolean;
  handleGet(params: GetItemInput, callback: Callback): void;
  canHandlePut(params: PutItemInput): boolean;
  handlePut(params: PutItemInput, callback: Callback): void;
  canHandleDelete(params: DeleteItemInput): boolean;
  handleDelete(params: DeleteItemInput, callback: Callback): void;
  canHandleQuery(params: QueryInput): boolean;
  handleQuery(params: QueryInput, callback: Callback): void;
  canHandleScan(params: ScanInput): boolean;
  handleScan(params: ScanInput, callback: Callback): boolean;
  canHandleBatchWrite(params: BatchWriteItemInput): boolean;
  handleBatchWrite(params: BatchWriteItemInput, callback: Callback): void;
}
