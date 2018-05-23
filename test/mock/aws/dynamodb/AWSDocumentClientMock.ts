export interface AWSDocumentClientMock {
  canHandleGet(params: any): boolean;
  handleGet(params: any, callback: (error?: Error, response?: any) => void): void;
  canHandlePut(params: any): boolean;
  handlePut(params: any, callback: (error?: Error, response?: any) => void): void;
  canHandleQuery(params: any): boolean;
  handleQuery(params: any, callback: (error?: Error, response?: any) => void): void;
  canHandleScan(params: any): boolean;
  handleScan(params: any, callback: (error?: Error, response?: any) => void): boolean;
  canHandleBatchWrite(params: any): boolean;
  handleBatchWrite(params: any, callback: (error?: Error, response?: any) => void): void;
}
